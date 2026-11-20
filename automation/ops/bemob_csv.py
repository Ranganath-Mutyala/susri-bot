"""Reads BeMob's Conversions report export (CSV).

The BeMob API is not used yet on purpose: its endpoints could not be verified for this
build. The CSV export from the BeMob UI (Conversions tab -> export) is reliable, and the
column names are configurable in config.yaml.
"""
from __future__ import annotations

import csv
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from .config import Config, ConfigError
from .rules import ACCEPTED, PENDING, REJECTED, Conversion

_TIME_FORMATS = ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%S", "%d.%m.%Y %H:%M:%S",
                 "%d/%m/%Y %H:%M:%S", "%m/%d/%Y %H:%M:%S", "%Y-%m-%d")


def read_rows(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    text = Path(path).read_text(encoding="utf-8-sig")
    try:
        dialect = csv.Sniffer().sniff(text.splitlines()[0], delimiters=",;\t")
    except (csv.Error, IndexError):
        dialect = csv.excel
    reader = csv.DictReader(text.splitlines(), dialect=dialect)
    rows = [{(k or "").strip(): (v or "").strip() for k, v in r.items()} for r in reader]
    return [h.strip() for h in (reader.fieldnames or [])], rows


def _pick(headers: list[str], candidates: list[str]) -> str | None:
    lower = {h.lower(): h for h in headers}
    return next((lower[c.lower()] for c in candidates if c.lower() in lower), None)


def resolve_columns(headers: list[str], cfg: Config) -> dict[str, str | None]:
    return {key: _pick(headers, cands) for key, cands in cfg.csv_columns.items()}


def _parse_time(value: str, tz: ZoneInfo) -> datetime | None:
    value = value.strip()
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(value)
        return dt if dt.tzinfo else dt.replace(tzinfo=tz)
    except ValueError:
        pass
    for fmt in _TIME_FORMATS:
        try:
            return datetime.strptime(value, fmt).replace(tzinfo=tz)
        except ValueError:
            continue
    return None


def _money(value: str) -> float:
    cleaned = value.replace("$", "").replace("USD", "").replace(" ", "")
    if cleaned.count(",") == 1 and "." not in cleaned:
        cleaned = cleaned.replace(",", ".")
    cleaned = cleaned.replace(",", "")
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def normalize_status(value: str, cfg: Config) -> str:
    v = value.strip().lower()
    if v in cfg.accepted_statuses:
        return ACCEPTED
    if v in cfg.rejected_statuses:
        return REJECTED
    return PENDING


def load_conversions(path: str | Path, cfg: Config) -> list[Conversion]:
    headers, rows = read_rows(Path(path))
    cols = resolve_columns(headers, cfg)
    missing = [k for k in ("click_id", "status", "payout", "campaign") if not cols.get(k)]
    if missing:
        raise ConfigError(
            f"BeMob CSV is missing columns for {missing}. Headers in the file: {headers}. "
            "Add the right header names under bemob_csv.columns in config.yaml.")
    tz = ZoneInfo(cfg.csv_timezone)
    out = []
    for r in rows:
        out.append(Conversion(
            click_id=r.get(cols["click_id"], ""),
            gclid=r.get(cols["external_id"], "") if cols.get("external_id") else "",
            status=normalize_status(r.get(cols["status"], ""), cfg),
            payout_usd=_money(r.get(cols["payout"], "0")),
            campaign=r.get(cols["campaign"], ""),
            time=_parse_time(r.get(cols["time"], ""), tz) if cols.get("time") else None,
        ))
    return dedupe(out)


def dedupe(conversions: list[Conversion]) -> list[Conversion]:
    """One row per click: a final status (accepted/rejected) wins over pending."""
    rank = {PENDING: 0, REJECTED: 1, ACCEPTED: 1}
    best: dict[str, Conversion] = {}
    no_id: list[Conversion] = []
    for c in conversions:
        if not c.click_id:
            no_id.append(c)
            continue
        cur = best.get(c.click_id)
        if cur is None or rank[c.status] >= rank[cur.status]:
            best[c.click_id] = c
    return list(best.values()) + no_id
