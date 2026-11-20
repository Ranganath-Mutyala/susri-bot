from datetime import datetime, timezone

from ops import rules
from ops.bemob_csv import load_conversions
from ops.rules import Conversion, KeywordStat, SearchTerm
from pathlib import Path

SAMPLE = Path(__file__).resolve().parents[1] / "sample" / "bemob_conversions_sample.csv"
CID = "11111111111"


def test_junk_terms_whole_words_only(cfg):
    terms = [SearchTerm(CID, "best free crm for startups", 1.2, 2, 0),
             SearchTerm(CID, "crm login", 0.5, 1, 0),
             SearchTerm(CID, "freelancer crm comparison", 3.0, 4, 1),   # "free" inside a word: keep
             SearchTerm(CID, "hubspot jobs", 0.3, 1, 0)]
    out = rules.junk_negatives(terms, cfg.junk_words, existing={CID: {"hubspot jobs"}})
    assert [a.target for a in out] == ["best free crm for startups", "crm login"]


def test_daily_cap(cfg):
    out = rules.daily_cap_breaches({CID: 10.5}, {CID}, cfg.offers)
    assert len(out) == 1 and out[0].kind == "pause_campaign"
    assert rules.daily_cap_breaches({CID: 9.99}, {CID}, cfg.offers) == []
    assert rules.daily_cap_breaches({CID: 50}, set(), cfg.offers) == []  # already paused


def test_keyword_pause_at_two_times_payout(cfg):
    ks = [KeywordStat(CID, "1", "10", "ai notes app", "EXACT", 40.0, 0),
          KeywordStat(CID, "1", "11", "ai notes", "PHRASE", 39.9, 0),
          KeywordStat(CID, "1", "12", "ai crm", "EXACT", 80.0, 1)]
    assert [a.target for a in rules.keywords_to_pause(ks, cfg)] == ["10"]


def test_csv_dedupe_and_rejection(cfg):
    convs = load_conversions(SAMPLE, cfg)
    by_id = {c.click_id: c for c in convs}
    assert by_id["ck001"].status == "accepted"           # approved row wins over pending
    assert by_id["ck001"].time.tzinfo is not None
    offer = cfg.offers[0]
    rate, decided, action = rules.rejection_check(convs, offer, cfg)
    assert decided == 3 and round(rate, 2) == 0.33
    assert action is None                                  # below min sample of 5


def test_rejection_alert_fires(cfg):
    o = cfg.offers[0]
    convs = [Conversion(str(i), "g", "rejected" if i < 3 else "accepted", 20, o.bemob_campaign, None) for i in range(6)]
    _, _, action = rules.rejection_check(convs, o, cfg)
    assert action and action.kind == "alert"


def test_profit(cfg):
    convs = load_conversions(SAMPLE, cfg)
    [row] = rules.profit_rows({CID: 30.0}, convs, cfg)
    assert (row.accepted, row.pending, row.rejected) == (2, 1, 1)
    assert row.revenue_usd == 40.0 and row.net_usd == 10.0


def test_breakeven():
    assert abs(rules.max_breakeven_cpc(1.5, 0.4) - 0.6) < 1e-9
