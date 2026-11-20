"""Prints alerts and, if configured, sends them to Telegram (free and works well on a phone).

Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID as environment variables to enable.
"""
from __future__ import annotations

import json
import os
import urllib.request


def send(lines: list[str], title: str = "WiseCompare") -> None:
    if not lines:
        return
    text = f"⚠️ {title}\n" + "\n".join(f"• {l}" for l in lines)
    print(text)
    token, chat = os.environ.get("TELEGRAM_BOT_TOKEN"), os.environ.get("TELEGRAM_CHAT_ID")
    if not (token and chat):
        return
    body = json.dumps({"chat_id": chat, "text": text[:4000]}).encode()
    req = urllib.request.Request(f"https://api.telegram.org/bot{token}/sendMessage", data=body,
                                 headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req, timeout=15).read()
    except Exception as exc:  # an alert failure must never stop the stop-loss
        print(f"(Telegram send failed: {exc})")
