import asyncio

from beeai_framework.backend.chat import ChatModel
from beeai_framework.tools.search.wikipedia import WikipediaTool
from beeai_framework.tools.weather.openmeteo import OpenMeteoTool
from beeai_framework.workflows.agent import AgentWorkflow, AgentWorkflowInput


async def main() -> None:
    llm = ChatModel.from_name("ollama:granite3.2:2b")
    workflow = AgentWorkflow(name="Smart assistant")

    workflow.add_agent(
        name="Researcher",
        role="A diligent researcher.",
        instructions="You look up and provide information about a specific topic.",
        tools=[WikipediaTool()],
        llm=llm,
    )

    workflow.add_agent(
        name="WeatherForecaster",
        role="A weather reporter.",
        instructions="You provide detailed weather reports.",
        tools=[OpenMeteoTool()],
        llm=llm,
    )

    workflow.add_agent(
        name="DataSynthesizer",
        role="A meticulous and creative data synthesizer",
        instructions="You can combine disparate information into a final coherent summary.",
        llm=llm,
    )

    location = "Saint-Tropez"

    response = await workflow.run(
        inputs=[
            AgentWorkflowInput(
                prompt=f"Provide a short history of {location}.",
            ),
            AgentWorkflowInput(
                prompt=f"Provide a comprehensive weather summary for {location} today.",
                expected_output="Essential weather details such as chance of rain, temperature and wind. Only report information that is available.",
            ),
            AgentWorkflowInput(
                prompt=f"Summarize the historical and weather data for {location}.",
                expected_output=f"A paragraph that describes the history of {location}, followed by the current weather conditions.",
            ),
        ]
    ).on(
        "success",
        lambda data, event: print(
            f"\n-> Step '{data.step}' has been completed with the following outcome.\n\n{data.state.final_answer}"
        ),
    )

    print("==== Final Answer ====")
    print(response.result.final_answer)


if __name__ == "__main__":
    asyncio.run(main())
