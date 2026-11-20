"""Pure decision logic: takes plain data, returns actions. No API calls here, so it is easy to test."""
from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime

from .config import Config, Offer

ACCEPTED, REJECTED, PENDING = "accepted", "rejected", "pending"


@dataclass
class SearchTerm:
    campaign_id: str
    term: str
    cost_usd: float
    clicks: int
    conversions: float


@dataclass
class KeywordStat:
    campaign_id: str
    ad_group_id: str
    criterion_id: str
    text: str
    match_type: str
    cost_usd: float
    conversions: float


@dataclass
class Conversion:
    click_id: str
    gclid: str
    status: str  # accepted | rejected | pending
    payout_usd: float
    campaign: str
    time: datetime | None


@dataclass
class Action:
    kind: str          # add_negative | pause_campaign | pause_keyword | alert | suggest
    campaign_id: str
    detail: str
    target: str = ""   # keyword text / criterion id
    ad_group_id: str = ""


# ---------- negatives ----------

def _contains_word(term: str, word: str) -> bool:
    return re.search(rf"(?<![a-z0-9]){re.escape(word)}(?![a-z0-9])", term) is not None


def junk_negatives(terms: list[SearchTerm], junk_words: list[str], existing: dict[str, set[str]]) -> list[Action]:
    """Search terms containing a junk word become exact-match campaign negatives."""
    out: list[Action] = []
    seen: set[tuple[str, str]] = set()
    for t in terms:
        term = t.term.lower().strip()
        if not term or (t.campaign_id, term) in seen or term in existing.get(t.campaign_id, set()):
            continue
        hit = next((w for w in junk_words if _contains_word(term, w)), None)
        if hit:
            seen.add((t.campaign_id, term))
            out.append(Action("add_negative", t.campaign_id, f'contains "{hit}" (cost ${t.cost_usd:.2f})', target=term))
    return out


def wasted_term_suggestions(terms: list[SearchTerm], cfg: Config, already: set[tuple[str, str]]) -> list[Action]:
    """Costly zero-conversion terms: only SUGGESTED, a human decides."""
    out = []
    for t in terms:
        offer = cfg.offer_by_campaign(t.campaign_id)
        if not offer or (t.campaign_id, t.term.lower()) in already:
            continue
        if t.conversions == 0 and t.cost_usd >= offer.payout_usd * cfg.suggest_wasted_multiple:
            out.append(Action("suggest", t.campaign_id,
                              f"${t.cost_usd:.2f} spent, {t.clicks} clicks, 0 conversions", target=t.term))
    return out


# ---------- stop-loss ----------

def daily_cap_breaches(today_cost_usd: dict[str, float], enabled: set[str], offers: list[Offer]) -> list[Action]:
    out = []
    for o in offers:
        cost = today_cost_usd.get(o.campaign_id, 0.0)
        if o.campaign_id in enabled and cost >= o.daily_cap_usd:
            out.append(Action("pause_campaign", o.campaign_id,
                              f"{o.name}: spent ${cost:.2f} today, hard cap ${o.daily_cap_usd:.2f}"))
    return out


def keywords_to_pause(keywords: list[KeywordStat], cfg: Config) -> list[Action]:
    out = []
    for k in keywords:
        offer = cfg.offer_by_campaign(k.campaign_id)
        if not offer:
            continue
        limit = offer.payout_usd * cfg.kw_multiple
        if k.conversions == 0 and k.cost_usd >= limit:
            out.append(Action("pause_keyword", k.campaign_id,
                              f'"{k.text}" [{k.match_type}] spent ${k.cost_usd:.2f} with 0 conversions (limit ${limit:.2f})',
                              target=k.criterion_id, ad_group_id=k.ad_group_id))
    return out


def rejection_check(conversions: list[Conversion], offer: Offer, cfg: Config) -> tuple[float, int, Action | None]:
    mine = [c for c in conversions if c.campaign == offer.bemob_campaign]
    accepted = sum(c.status == ACCEPTED for c in mine)
    rejected = sum(c.status == REJECTED for c in mine)
    decided = accepted + rejected
    rate = rejected / decided if decided else 0.0
    action = None
    if decided >= cfg.rejection_min_decided and rate > cfg.rejection_alert:
        kind = "pause_campaign" if cfg.pause_on_high_rejection else "alert"
        action = Action(kind, offer.campaign_id,
                        f"{offer.name}: MyLead rejected {rejected}/{decided} leads ({rate:.0%}) - plan says KILL this offer")
    return rate, decided, action


# ---------- money ----------

@dataclass
class ProfitRow:
    offer: str
    spend_usd: float
    accepted: int
    pending: int
    rejected: int
    revenue_usd: float

    @property
    def net_usd(self) -> float:
        return self.revenue_usd - self.spend_usd

    @property
    def roi(self) -> float | None:
        return self.net_usd / self.spend_usd if self.spend_usd else None

    @property
    def cost_per_accepted(self) -> float | None:
        return self.spend_usd / self.accepted if self.accepted else None


def profit_rows(spend_usd: dict[str, float], conversions: list[Conversion], cfg: Config) -> list[ProfitRow]:
    rows = []
    for o in cfg.offers:
        mine = [c for c in conversions if c.campaign == o.bemob_campaign]
        acc = [c for c in mine if c.status == ACCEPTED]
        rows.append(ProfitRow(
            offer=o.name,
            spend_usd=spend_usd.get(o.campaign_id, 0.0),
            accepted=len(acc),
            pending=sum(c.status == PENDING for c in mine),
            rejected=sum(c.status == REJECTED for c in mine),
            revenue_usd=sum(c.payout_usd for c in acc),
        ))
    return rows


def max_breakeven_cpc(offer_epc_usd: float, lp_ctr: float) -> float:
    """Plan formula: Max CPC = Offer EPC x Landing Page CTR."""
    return offer_epc_usd * lp_ctr
