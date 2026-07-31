from uuid import uuid4

from app.graphs import case_learning_graph as graph_module
from app.models.case_intent import CaseIntentResult


class FailingBenefitTool:
    def invoke(self, *args, **kwargs):
        raise AssertionError(
            "Eligibility questions must not call the benefit search tool."
        )


def test_eligibility_question_does_not_search_benefits(
    monkeypatch,
):
    def fake_classify_case_intent(
        latest_message: str,
        conversation_history: list[str] | None = None,
    ) -> CaseIntentResult:
        return CaseIntentResult(
            intent="ask_eligibility_question",
            subject="international student",
            referenced_programs=["Employment Insurance"],
            classification_method="ollama",
        )

    monkeypatch.setattr(
        graph_module,
        "classify_case_intent",
        fake_classify_case_intent,
    )

    monkeypatch.setattr(
        graph_module,
        "search_benefit_catalog",
        FailingBenefitTool(),
    )

    config = {
        "configurable": {
            "thread_id": f"test-{uuid4()}",
        }
    }

    result = graph_module.case_graph.invoke(
        {
            "user_message": (
                "Does Employment Insurance apply "
                "to international students?"
            )
        },
        config=config,
    )

    assert result["current_intent"] == "ask_eligibility_question"
    assert result["benefit_matches"] == []
    assert "will not repeat" in result["response"]
