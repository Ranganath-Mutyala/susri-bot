"""Loads and validates config.yaml."""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import yaml


class ConfigError(Exception):
    pass


@dataclass
class Offer:
    key: str
    name: str
    campaign_id: str
    bemob_campaign: str
    payout_usd: float
    daily_cap_usd: float


@dataclass
class Config:
    credentials_file: Path
    customer_id: str
    fx_to_usd: float
    conversion_action_id: str
    consent_ad_user_data: str
    offers: list[Offer]
    kw_multiple: float
    kw_lookback_days: int
    rejection_alert: float
    rejection_min_decided: int
    pause_on_high_rejection: bool
    monthly_loss_limit_usd: float
    neg_lookback_days: int
    junk_words: list[str]
    suggest_wasted_multiple: float
    csv_timezone: str
    csv_columns: dict[str, list[str]]
    accepted_statuses: set[str]
    rejected_statuses: set[str]
    lp_ctr: float
    base_dir: Path = field(default_factory=Path.cwd)

    def offer_by_campaign(self, campaign_id: str) -> Offer | None:
        return next((o for o in self.offers if o.campaign_id == str(campaign_id)), None)

    @property
    def campaign_ids(self) -> list[str]:
        return [o.campaign_id for o in self.offers]


def _digits(value, name: str) -> str:
    s = str(value).replace("-", "").strip()
    if not s.isdigit():
        raise ConfigError(f"{name} must be digits only (got {value!r})")
    return s


def load(path: str | Path = "config.yaml") -> Config:
    path = Path(path)
    if not path.exists():
        raise ConfigError(f"{path} not found. Run: cp config.example.yaml config.yaml, then edit it.")
    raw = yaml.safe_load(path.read_text()) or {}
    g, gr, ng, bc = raw.get("google_ads", {}), raw.get("guardrails", {}), raw.get("negatives", {}), raw.get("bemob_csv", {})

    offers = []
    for o in raw.get("offers") or []:
        offers.append(Offer(
            key=str(o["key"]),
            name=str(o.get("name", o["key"])),
            campaign_id=_digits(o["google_ads_campaign_id"], f"offers[{o['key']}].google_ads_campaign_id"),
            bemob_campaign=str(o.get("bemob_campaign", "")),
            payout_usd=float(o["payout_usd"]),
            daily_cap_usd=float(o["daily_cap_usd"]),
        ))
    if not offers:
        raise ConfigError("config.yaml has no offers")
    for o in offers:
        if o.payout_usd <= 0 or o.daily_cap_usd <= 0:
            raise ConfigError(f"offer {o.key}: payout_usd and daily_cap_usd must be > 0")

    consent = str(g.get("consent_ad_user_data", "UNSPECIFIED")).upper()
    if consent not in {"UNSPECIFIED", "GRANTED", "DENIED"}:
        raise ConfigError("consent_ad_user_data must be UNSPECIFIED, GRANTED or DENIED")

    return Config(
        credentials_file=(path.parent / g.get("credentials_file", "google-ads.yaml")),
        customer_id=_digits(g.get("customer_id", ""), "google_ads.customer_id"),
        fx_to_usd=float(g.get("account_currency_to_usd", 1.0)),
        conversion_action_id=str(g.get("offline_conversion_action_id", "")).strip(),
        consent_ad_user_data=consent,
        offers=offers,
        kw_multiple=float(gr.get("keyword_zero_conv_payout_multiple", 2.0)),
        kw_lookback_days=int(gr.get("keyword_lookback_days", 14)),
        rejection_alert=float(gr.get("rejection_rate_alert", 0.30)),
        rejection_min_decided=int(gr.get("rejection_min_decided_leads", 5)),
        pause_on_high_rejection=bool(gr.get("pause_on_high_rejection", False)),
        monthly_loss_limit_usd=float(gr.get("monthly_loss_limit_usd", 150)),
        neg_lookback_days=int(ng.get("lookback_days", 7)),
        junk_words=[str(w).lower() for w in ng.get("junk_words", [])],
        suggest_wasted_multiple=float(ng.get("suggest_wasted_payout_multiple", 1.0)),
        csv_timezone=str(bc.get("timezone", "UTC")),
        csv_columns={k: list(v) for k, v in (bc.get("columns") or {}).items()},
        accepted_statuses={str(s).lower() for s in bc.get("accepted_statuses", ["approved", "accepted"])},
        rejected_statuses={str(s).lower() for s in bc.get("rejected_statuses", ["rejected", "declined"])},
        lp_ctr=float(raw.get("landing_page", {}).get("ctr", 0.40)),
        base_dir=path.parent,
    )
