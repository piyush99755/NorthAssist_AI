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
    
def test_start_new_case_does_not_search_benefits(
    monkeypatch,
) -> CaseIntentResult:
    def fake_classify_case_intent(
        latest_message: str,
        conversation_history: list[str] | None = None,
    ) -> CaseIntentResult:
        return CaseIntentResult(
            intent="start_new_case",
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
        {"user_message": "Start a new case."},
        config=config,
    )
    
    assert result["current_intent"] == "start_new_case"
    assert result["benefit_matches"] == []
    assert "new case" in result["response"].lower()
    
def test_other_intent_does_not_search_benefits(
    monkeypatch,
    
):
    def fake_classify_case_intent(
        latest_message:str,
        conversation_history: list[str] | None = None,
    ) -> CaseIntentResult:
        return CaseIntentResult(
            intent="other",
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
        {"user_message": "Tell me a joke."},
        config=config,
    )
    
    assert result["current_intent"] == "other"
    assert result["benefit_matches"] == []
    assert "I can help" in result["response"]


def test_selected_benefit_id_controls_eligibility_context(
    monkeypatch,
):
    def fake_classify_case_intent(
        latest_message: str,
        conversation_history: list[str] | None = None,
    ) -> CaseIntentResult:
        return CaseIntentResult(
            intent="ask_eligibility_question",
            subject="international student",
            referenced_programs=[],
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

    result = graph_module.case_graph.invoke(
        {
            "user_message": "Does this apply to international students?",
            "selected_benefit_id": "ei-regular",
        },
        config={"configurable": {"thread_id": f"test-{uuid4()}"}},
    )

    assert result["selected_benefit_id"] == "ei-regular"
    assert result["benefit_matches"] == []
    assert "Employment Insurance (EI) Regular Benefits" in result["response"]
