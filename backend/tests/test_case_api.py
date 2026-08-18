from fastapi.testclient import TestClient

from app.main import app


def test_case_api_rejects_unknown_selected_benefit_id() -> None:
    client = TestClient(app)

    response = client.post(
        "/cases",
        json={
            "message": "Does this apply to me?",
            "selected_benefit_id": "made-up-program",
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"] == (
        "selected_benefit_id is not in the NorthAssist benefit catalog."
    )
