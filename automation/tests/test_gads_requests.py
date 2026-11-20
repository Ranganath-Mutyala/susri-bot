"""Builds real Google Ads SDK request objects with the network calls stubbed out."""
from datetime import datetime, timezone

import pytest

pytest.importorskip("google.ads.googleads")
from google.ads.googleads.client import GoogleAdsClient

from ops.gads import GoogleAds
from ops.rules import Conversion


class FakeService:
    def __init__(self, real_cls):
        self.real = real_cls
        self.calls = []

    def __getattr__(self, name):
        if name.endswith("_path"):
            return getattr(self.real, name)
        def record(**kw):
            self.calls.append((name, kw))
            class R:  # minimal response
                results = []
                partial_failure_error = None
            return R()
        return record


@pytest.fixture
def ga(cfg):
    import importlib
    client = GoogleAdsClient(credentials=None, developer_token="x", use_proto_plus=True)
    services = {}

    def get_service(name):
        if name not in services:
            mod = importlib.import_module(f"google.ads.googleads.{client.version or 'v26'}.services.services."
                                          + "".join("_" + c.lower() if c.isupper() else c for c in name).lstrip("_"))
            services[name] = FakeService(getattr(mod, name + "Client"))
        return services[name]

    client.get_service = get_service
    g = GoogleAds.__new__(GoogleAds)
    g.cfg, g.client, g.cid, g._svc = cfg, client, cfg.customer_id, None
    cfg.conversion_action_id = "555"
    return g, services


def test_pause_campaign_builds_mask(ga):
    g, s = ga
    g.pause_campaign("11111111111")
    name, kw = s["CampaignService"].calls[0]
    op = kw["operations"][0]
    assert name == "mutate_campaigns"
    assert op.update.resource_name == "customers/1234567890/campaigns/11111111111"
    assert op.update.status.name == "PAUSED"
    assert "status" in op.update_mask.paths


def test_pause_keyword(ga):
    g, s = ga
    g.pause_keyword("22", "33")
    op = s["AdGroupCriterionService"].calls[0][1]["operations"][0]
    assert op.update.resource_name == "customers/1234567890/adGroupCriteria/22~33"
    assert "status" in op.update_mask.paths


def test_negatives(ga):
    g, s = ga
    g.add_campaign_negatives([("11111111111", "crm login")])
    op = s["CampaignCriterionService"].calls[0][1]["operations"][0]
    assert op.create.negative and op.create.keyword.text == "crm login"
    assert op.create.keyword.match_type.name == "EXACT"


def test_upload_request(ga):
    g, s = ga
    t = datetime(2026, 11, 19, 9, 0, tzinfo=timezone.utc)
    g.upload_click_conversions([Conversion("ck1", "gclid1", "accepted", 20.0, "c", t)], validate_only=True)
    req = s["ConversionUploadService"].calls[0][1]["request"]
    cc = req.conversions[0]
    assert req.validate_only and req.partial_failure
    assert cc.conversion_date_time == "2026-11-19 09:00:00+00:00"
    assert cc.conversion_action == "customers/1234567890/conversionActions/555"
    assert cc.currency_code == "USD" and cc.order_id == "ck1"
