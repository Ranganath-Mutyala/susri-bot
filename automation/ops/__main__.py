"""WiseCompare ops CLI.  Every command that changes Google Ads is a DRY RUN unless you add --apply.

  python -m ops check                         # verify credentials, list campaigns + conversion actions
  python -m ops breakeven --epc 1.20          # max CPC you can afford for an offer
  python -m ops csvcheck data/bemob.csv       # show how your BeMob export is read
  python -m ops negatives [--apply]           # block junk search terms
  python -m ops stoploss [--apply] [--bemob-csv FILE]
  python -m ops profit --bemob-csv FILE [--days 7]
  python -m ops upload --bemob-csv FILE [--apply]
  python -m ops resume --campaign ID          # re-enable a campaign the stop-loss paused (never changes budget)

Nothing in this tool ever increases a budget. Budget increases are always manual.
"""
from __future__ import annotations

import argparse
import csv
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from . import alerts, rules
from .bemob_csv import load_conversions, read_rows, resolve_columns
from .config import ConfigError, load


def _gads(cfg):
    from .gads import GoogleAds
    return GoogleAds(cfg)


def _mode(apply: bool) -> str:
    return "APPLYING" if apply else "DRY RUN (nothing changed; add --apply to act)"


def cmd_check(cfg, args):
    g = _gads(cfg)
    info = g.account_info()
    print(f"Account: {info.get('name')}  currency={info.get('currency')}  timezone={info.get('time_zone')}")
    if info.get("currency") and info["currency"] != "USD" and cfg.fx_to_usd == 1.0:
        print(f"  !! Account currency is {info['currency']}, but account_currency_to_usd is 1.0. Fix config.yaml.")
    print("\nCampaigns:")
    configured = set(cfg.campaign_ids)
    for c in g.list_campaigns():
        mark = "  <- in config" if c["id"] in configured else ""
        print(f"  {c['id']}  {c['status']:<8} ${c['daily_budget_usd']:.2f}/day  {c['name']}{mark}")
        if c["id"] in configured:
            offer = cfg.offer_by_campaign(c["id"])
            if c["daily_budget_usd"] > offer.daily_cap_usd * 1.01:
                print(f"     !! budget is above your hard cap (${offer.daily_cap_usd:.2f}). Lower it in Google Ads.")
    missing = configured - {c["id"] for c in g.list_campaigns()}
    for m in missing:
        print(f"  !! campaign {m} from config.yaml was not found in this account")
    print("\nOffline conversion actions (type: Import from clicks):")
    actions = g.list_upload_conversion_actions()
    for a in actions:
        mark = "  <- in config" if a["id"] == cfg.conversion_action_id else ""
        print(f"  {a['id']}  {a['status']:<8} {a['name']}{mark}")
    if not actions:
        print("  none yet: create one in Google Ads > Goals > Conversions > New > Import > 'CRMs, files...' > track conversions from clicks")


def cmd_breakeven(cfg, args):
    cpc = rules.max_breakeven_cpc(args.epc, cfg.lp_ctr)
    print(f"Offer EPC ${args.epc:.2f} x landing page CTR {cfg.lp_ctr:.0%} = max break-even CPC ${cpc:.2f}")
    print(f"Set your max CPC bid BELOW this, e.g. ${cpc * 0.8:.2f} (20% safety margin).")


def cmd_csvcheck(cfg, args):
    headers, rows = read_rows(Path(args.file))
    print(f"{len(rows)} rows. Headers: {headers}")
    for k, v in resolve_columns(headers, cfg).items():
        print(f"  {k:<12} -> {v or 'NOT FOUND'}")
    convs = load_conversions(args.file, cfg)
    by = {}
    for c in convs:
        by.setdefault((c.campaign, c.status), 0)
        by[(c.campaign, c.status)] += 1
    print("\nUnique clicks by campaign / status:")
    for (camp, st), n in sorted(by.items()):
        print(f"  {camp or '(blank)'} | {st}: {n}")
    no_gclid = sum(1 for c in convs if c.status == rules.ACCEPTED and not c.gclid)
    if no_gclid:
        print(f"\n!! {no_gclid} accepted conversions have no gclid. Check BeMob traffic source: External ID must be gclid.")


def cmd_negatives(cfg, args):
    g = _gads(cfg)
    terms = g.search_terms(cfg.neg_lookback_days)
    existing = g.existing_negatives()
    adds = rules.junk_negatives(terms, cfg.junk_words, existing)
    already = {(a.campaign_id, a.target) for a in adds}
    suggestions = rules.wasted_term_suggestions(terms, cfg, already | {(c, t) for c, s in existing.items() for t in s})
    print(f"{_mode(args.apply)} — scanned {len(terms)} search terms (last {cfg.neg_lookback_days} days)")
    for a in adds:
        print(f"  NEGATIVE [{a.campaign_id}] [{a.target}]  {a.detail}")
    if args.apply and adds:
        n = g.add_campaign_negatives([(a.campaign_id, a.target) for a in adds])
        print(f"  added {n} exact-match negatives")
    if suggestions:
        print("\nReview these yourself (costly, 0 conversions; NOT added automatically):")
        for s in suggestions:
            print(f"  [{s.campaign_id}] \"{s.target}\"  {s.detail}")
    if not adds and not suggestions:
        print("  nothing to block")


def _month_spend(g) -> float:
    today = date.today()
    return sum(g.cost_between(today.replace(day=1), today).values())


def cmd_stoploss(cfg, args):
    g = _gads(cfg)
    status = g.campaign_status()
    enabled = {cid for cid, s in status.items() if s == "ENABLED"}
    today = g.cost_by_campaign("TODAY")
    actions = rules.daily_cap_breaches(today, enabled, cfg.offers)
    actions += rules.keywords_to_pause(g.keyword_stats(cfg.kw_lookback_days), cfg)

    convs = load_conversions(args.bemob_csv, cfg) if args.bemob_csv else []
    for o in cfg.offers if convs else []:
        rate, decided, act = rules.rejection_check(convs, o, cfg)
        print(f"  {o.name}: rejection {rate:.0%} of {decided} decided leads")
        if act:
            actions.append(act)

    month_spend = _month_spend(g)
    month_rev = sum(c.payout_usd for c in convs if c.status == rules.ACCEPTED and c.time
                    and c.time.astimezone(timezone.utc).date() >= date.today().replace(day=1))
    month_loss = month_spend - month_rev
    revenue_note = "" if convs else " (revenue unknown without --bemob-csv, counting all spend as loss)"
    print(f"  This month: spend ${month_spend:.2f}, accepted revenue ${month_rev:.2f}, "
          f"net ${-month_loss:+.2f}{revenue_note}")

    print(f"\n{_mode(args.apply)}")
    alert_lines = []
    if month_loss > cfg.monthly_loss_limit_usd:
        alert_lines.append(f"Monthly loss ${month_loss:.2f} is above your limit ${cfg.monthly_loss_limit_usd:.2f}. "
                           "STOP and review before spending more.")
    for a in actions:
        print(f"  {a.kind.upper():<15} [{a.campaign_id}] {a.detail}")
        if a.kind == "alert":
            alert_lines.append(a.detail)
        elif args.apply and a.kind == "pause_campaign" and a.campaign_id in enabled:
            g.pause_campaign(a.campaign_id)
            enabled.discard(a.campaign_id)
            alert_lines.append(f"PAUSED campaign: {a.detail}. Resume: python -m ops resume --campaign {a.campaign_id}")
        elif args.apply and a.kind == "pause_keyword":
            g.pause_keyword(a.ad_group_id, a.target)
            alert_lines.append(f"PAUSED keyword: {a.detail}")
    if not actions:
        print("  all offers inside guardrails")
    if args.apply or any("Monthly loss" in l for l in alert_lines):
        alerts.send(alert_lines, "WiseCompare stop-loss")


def cmd_profit(cfg, args):
    g = _gads(cfg)
    end = date.today()
    start = end - timedelta(days=args.days - 1)
    convs = [c for c in load_conversions(args.bemob_csv, cfg)
             if c.time is None or start <= c.time.astimezone(timezone.utc).date() <= end]
    rows = rules.profit_rows(g.cost_between(start, end), convs, cfg)
    print(f"True net profit {start} .. {end} (Google spend vs MyLead ACCEPTED payouts)\n")
    print(f"{'Offer':<32}{'Spend':>9}{'Acc':>5}{'Pend':>5}{'Rej':>5}{'Revenue':>10}{'Net':>10}{'ROI':>7}{'$/Acc':>8}")
    for r in rows:
        roi = f"{r.roi:.0%}" if r.roi is not None else "-"
        cpa = f"{r.cost_per_accepted:.2f}" if r.cost_per_accepted is not None else "-"
        print(f"{r.offer[:31]:<32}{r.spend_usd:>9.2f}{r.accepted:>5}{r.pending:>5}{r.rejected:>5}"
              f"{r.revenue_usd:>10.2f}{r.net_usd:>+10.2f}{roi:>7}{cpa:>8}")
    tot_s, tot_r = sum(r.spend_usd for r in rows), sum(r.revenue_usd for r in rows)
    print(f"{'TOTAL':<32}{tot_s:>9.2f}{'':>15}{tot_r:>10.2f}{tot_r - tot_s:>+10.2f}")
    out = cfg.base_dir / "out"
    out.mkdir(exist_ok=True)
    path = out / f"profit-{end}.csv"
    with path.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["offer", "spend_usd", "accepted", "pending", "rejected", "revenue_usd", "net_usd"])
        for r in rows:
            w.writerow([r.offer, f"{r.spend_usd:.2f}", r.accepted, r.pending, r.rejected,
                        f"{r.revenue_usd:.2f}", f"{r.net_usd:.2f}"])
    print(f"\nSaved {path}")


def cmd_upload(cfg, args):
    if not cfg.conversion_action_id.isdigit() or set(cfg.conversion_action_id) == {"0"}:
        raise ConfigError("Set google_ads.offline_conversion_action_id in config.yaml (see: python -m ops check)")
    state = cfg.base_dir / "state" / "uploaded_click_ids.txt"
    done = set(state.read_text().split()) if state.exists() else set()
    convs = load_conversions(args.bemob_csv, cfg)
    our = {o.bemob_campaign for o in cfg.offers}
    now = datetime.now(timezone.utc)
    ready, skipped = [], {"not accepted": 0, "other campaign": 0, "no gclid": 0, "no time": 0,
                          "older than 90 days": 0, "already uploaded": 0}
    for c in convs:
        if c.status != rules.ACCEPTED: skipped["not accepted"] += 1
        elif c.campaign not in our: skipped["other campaign"] += 1
        elif not c.gclid: skipped["no gclid"] += 1
        elif not c.time: skipped["no time"] += 1
        elif now - c.time > timedelta(days=90): skipped["older than 90 days"] += 1
        elif c.click_id in done: skipped["already uploaded"] += 1
        else: ready.append(c)
    print(f"{_mode(args.apply)} — {len(ready)} accepted leads to upload. Skipped: "
          + ", ".join(f"{k}={v}" for k, v in skipped.items() if v))
    if not ready:
        return
    g = _gads(cfg)
    ok, errors = g.upload_click_conversions(ready, validate_only=not args.apply)
    for e in errors:
        print(f"  Google reported: {e}")
    if args.apply:
        state.parent.mkdir(exist_ok=True)
        with state.open("a") as f:
            f.writelines(f"{c.click_id}\n" for c in ready)
        print(f"  uploaded {ok} conversions")
    else:
        print("  Google validated the request (validate_only). Run again with --apply to upload.")


def cmd_resume(cfg, args):
    if not cfg.offer_by_campaign(args.campaign):
        raise ConfigError(f"campaign {args.campaign} is not in config.yaml; resume it in Google Ads instead")
    g = _gads(cfg)
    if g.cost_by_campaign("TODAY").get(args.campaign, 0) >= cfg.offer_by_campaign(args.campaign).daily_cap_usd:
        print("Today's spend is already at the cap. Resume tomorrow instead.")
        return
    g.enable_campaign(args.campaign)
    print(f"Campaign {args.campaign} enabled. Budget unchanged.")


def main(argv=None):
    p = argparse.ArgumentParser(prog="python -m ops", description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--config", default="config.yaml")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check")
    b = sub.add_parser("breakeven"); b.add_argument("--epc", type=float, required=True)
    c = sub.add_parser("csvcheck"); c.add_argument("file")
    n = sub.add_parser("negatives"); n.add_argument("--apply", action="store_true")
    s = sub.add_parser("stoploss"); s.add_argument("--apply", action="store_true"); s.add_argument("--bemob-csv")
    pr = sub.add_parser("profit"); pr.add_argument("--bemob-csv", required=True); pr.add_argument("--days", type=int, default=7)
    u = sub.add_parser("upload"); u.add_argument("--bemob-csv", required=True); u.add_argument("--apply", action="store_true")
    r = sub.add_parser("resume"); r.add_argument("--campaign", required=True)
    args = p.parse_args(argv)
    try:
        cfg = load(args.config)
        globals()[f"cmd_{args.cmd}"](cfg, args)
    except ConfigError as e:
        print(f"Config problem: {e}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
