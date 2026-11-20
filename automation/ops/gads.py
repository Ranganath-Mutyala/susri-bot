"""Thin wrapper around the official Google Ads Python SDK (google-ads)."""
from __future__ import annotations

from datetime import date, timedelta

from .config import Config
from .rules import Conversion, KeywordStat, SearchTerm


class GoogleAds:
    def __init__(self, cfg: Config):
        from google.ads.googleads.client import GoogleAdsClient  # imported lazily so tests don't need it

        self.cfg = cfg
        self.client = GoogleAdsClient.load_from_storage(str(cfg.credentials_file))
        self.cid = cfg.customer_id
        self._svc = self.client.get_service("GoogleAdsService")

    # ---------- reads ----------

    def _search(self, query: str):
        for batch in self._svc.search_stream(customer_id=self.cid, query=query):
            yield from batch.results

    def _usd(self, micros: int) -> float:
        return micros / 1_000_000 * self.cfg.fx_to_usd

    def _ids(self) -> str:
        return ", ".join(self.cfg.campaign_ids)

    @staticmethod
    def _range(days: int) -> str:
        end = date.today()
        start = end - timedelta(days=days - 1)
        return f"segments.date BETWEEN '{start:%Y-%m-%d}' AND '{end:%Y-%m-%d}'"

    def account_info(self) -> dict:
        q = "SELECT customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1"
        for r in self._search(q):
            return {"name": r.customer.descriptive_name, "currency": r.customer.currency_code,
                    "time_zone": r.customer.time_zone}
        return {}

    def list_campaigns(self) -> list[dict]:
        q = ("SELECT campaign.id, campaign.name, campaign.status, campaign_budget.amount_micros "
             "FROM campaign WHERE campaign.status != 'REMOVED' ORDER BY campaign.name")
        return [{"id": str(r.campaign.id), "name": r.campaign.name, "status": r.campaign.status.name,
                 "daily_budget_usd": self._usd(r.campaign_budget.amount_micros)} for r in self._search(q)]

    def list_upload_conversion_actions(self) -> list[dict]:
        q = ("SELECT conversion_action.id, conversion_action.name, conversion_action.status "
             "FROM conversion_action WHERE conversion_action.type = 'UPLOAD_CLICKS'")
        return [{"id": str(r.conversion_action.id), "name": r.conversion_action.name,
                 "status": r.conversion_action.status.name} for r in self._search(q)]

    def campaign_status(self) -> dict[str, str]:
        q = f"SELECT campaign.id, campaign.status FROM campaign WHERE campaign.id IN ({self._ids()})"
        return {str(r.campaign.id): r.campaign.status.name for r in self._search(q)}

    def cost_by_campaign(self, during: str = "TODAY", days: int | None = None) -> dict[str, float]:
        where = self._range(days) if days else f"segments.date DURING {during}"
        q = (f"SELECT campaign.id, metrics.cost_micros FROM campaign "
             f"WHERE campaign.id IN ({self._ids()}) AND {where}")
        out: dict[str, float] = {}
        for r in self._search(q):
            out[str(r.campaign.id)] = out.get(str(r.campaign.id), 0.0) + self._usd(r.metrics.cost_micros)
        return out

    def cost_between(self, start: date, end: date) -> dict[str, float]:
        q = (f"SELECT campaign.id, metrics.cost_micros FROM campaign WHERE campaign.id IN ({self._ids()}) "
             f"AND segments.date BETWEEN '{start:%Y-%m-%d}' AND '{end:%Y-%m-%d}'")
        out: dict[str, float] = {}
        for r in self._search(q):
            out[str(r.campaign.id)] = out.get(str(r.campaign.id), 0.0) + self._usd(r.metrics.cost_micros)
        return out

    def search_terms(self, days: int) -> list[SearchTerm]:
        q = ("SELECT campaign.id, search_term_view.search_term, metrics.cost_micros, metrics.clicks, "
             f"metrics.conversions FROM search_term_view WHERE campaign.id IN ({self._ids()}) AND {self._range(days)}")
        agg: dict[tuple[str, str], SearchTerm] = {}
        for r in self._search(q):
            key = (str(r.campaign.id), r.search_term_view.search_term.lower())
            t = agg.setdefault(key, SearchTerm(key[0], key[1], 0.0, 0, 0.0))
            t.cost_usd += self._usd(r.metrics.cost_micros)
            t.clicks += r.metrics.clicks
            t.conversions += r.metrics.conversions
        return list(agg.values())

    def existing_negatives(self) -> dict[str, set[str]]:
        q = ("SELECT campaign.id, campaign_criterion.keyword.text FROM campaign_criterion "
             f"WHERE campaign.id IN ({self._ids()}) AND campaign_criterion.negative = TRUE "
             "AND campaign_criterion.type = 'KEYWORD'")
        out: dict[str, set[str]] = {}
        for r in self._search(q):
            out.setdefault(str(r.campaign.id), set()).add(r.campaign_criterion.keyword.text.lower())
        return out

    def keyword_stats(self, days: int) -> list[KeywordStat]:
        q = ("SELECT campaign.id, ad_group.id, ad_group_criterion.criterion_id, ad_group_criterion.keyword.text, "
             "ad_group_criterion.keyword.match_type, metrics.cost_micros, metrics.conversions FROM keyword_view "
             f"WHERE campaign.id IN ({self._ids()}) AND ad_group_criterion.status = 'ENABLED' "
             f"AND ad_group.status = 'ENABLED' AND {self._range(days)}")
        agg: dict[str, KeywordStat] = {}
        for r in self._search(q):
            crit = r.ad_group_criterion
            key = f"{r.ad_group.id}~{crit.criterion_id}"
            k = agg.setdefault(key, KeywordStat(str(r.campaign.id), str(r.ad_group.id), str(crit.criterion_id),
                                                crit.keyword.text, crit.keyword.match_type.name, 0.0, 0.0))
            k.cost_usd += self._usd(r.metrics.cost_micros)
            k.conversions += r.metrics.conversions
        return list(agg.values())

    # ---------- writes (only ever pause / add negatives / upload conversions; never raise budgets) ----------

    def add_campaign_negatives(self, items: list[tuple[str, str]]) -> int:
        svc = self.client.get_service("CampaignCriterionService")
        campaign_svc = self.client.get_service("CampaignService")
        ops = []
        for campaign_id, text in items:
            op = self.client.get_type("CampaignCriterionOperation")
            c = op.create
            c.campaign = campaign_svc.campaign_path(self.cid, campaign_id)
            c.negative = True
            c.keyword.text = text[:80]
            c.keyword.match_type = self.client.enums.KeywordMatchTypeEnum.EXACT
            ops.append(op)
        if not ops:
            return 0
        resp = svc.mutate_campaign_criteria(customer_id=self.cid, operations=ops)
        return len(resp.results)

    def _set_campaign_status(self, campaign_id: str, status_name: str) -> None:
        from google.api_core import protobuf_helpers

        svc = self.client.get_service("CampaignService")
        op = self.client.get_type("CampaignOperation")
        camp = op.update
        camp.resource_name = svc.campaign_path(self.cid, campaign_id)
        camp.status = getattr(self.client.enums.CampaignStatusEnum, status_name)
        self.client.copy_from(op.update_mask, protobuf_helpers.field_mask(None, camp._pb))
        svc.mutate_campaigns(customer_id=self.cid, operations=[op])

    def pause_campaign(self, campaign_id: str) -> None:
        self._set_campaign_status(campaign_id, "PAUSED")

    def enable_campaign(self, campaign_id: str) -> None:
        self._set_campaign_status(campaign_id, "ENABLED")

    def pause_keyword(self, ad_group_id: str, criterion_id: str) -> None:
        from google.api_core import protobuf_helpers

        svc = self.client.get_service("AdGroupCriterionService")
        op = self.client.get_type("AdGroupCriterionOperation")
        crit = op.update
        crit.resource_name = svc.ad_group_criterion_path(self.cid, ad_group_id, criterion_id)
        crit.status = self.client.enums.AdGroupCriterionStatusEnum.PAUSED
        self.client.copy_from(op.update_mask, protobuf_helpers.field_mask(None, crit._pb))
        svc.mutate_ad_group_criteria(customer_id=self.cid, operations=[op])

    def upload_click_conversions(self, conversions: list[Conversion], validate_only: bool) -> tuple[int, list[str]]:
        svc = self.client.get_service("ConversionUploadService")
        action = self.client.get_service("ConversionActionService").conversion_action_path(
            self.cid, self.cfg.conversion_action_id)
        items = []
        for c in conversions:
            cc = self.client.get_type("ClickConversion")
            cc.gclid = c.gclid
            cc.conversion_action = action
            cc.conversion_date_time = c.time.replace(microsecond=0).isoformat(sep=" ")
            cc.conversion_value = float(c.payout_usd)
            cc.currency_code = "USD"
            cc.order_id = c.click_id  # lets Google de-duplicate if the same lead is uploaded twice
            if self.cfg.consent_ad_user_data != "UNSPECIFIED":
                cc.consent.ad_user_data = getattr(self.client.enums.ConsentStatusEnum, self.cfg.consent_ad_user_data)
            items.append(cc)
        if not items:
            return 0, []
        req = self.client.get_type("UploadClickConversionsRequest")
        req.customer_id = self.cid
        req.conversions.extend(items)
        req.partial_failure = True
        req.validate_only = validate_only
        resp = svc.upload_click_conversions(request=req)
        errors = []
        if resp.partial_failure_error and resp.partial_failure_error.message:
            errors.append(resp.partial_failure_error.message)
        ok = sum(1 for r in resp.results if r.gclid)
        return ok, errors
