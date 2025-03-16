import { tool } from "@langchain/core/tools"; // Import the tool function from LangChain

// Tool 1: Normal Advice
const normalAdvice = tool(
  async function normalAdviceTool(prompt: string) {
    // Logic to generate normal advice
    return `Here's some general advice regarding: ${prompt}`;
  },
  {
    name: "normal_advice",
    description: "This tool provides general advice to the user.",
  }
);

// Tool 2: Community Suggestion
const communitySuggestion = tool(
  async function communitySuggestionTool(prompt: string) {
    // Logic to generate community suggestions
    return `Here are some community suggestions for: ${prompt}`;
  },
  {
    name: "community_suggestion",
    description: "This tool provides suggestions based on community input.",
  }
);

// Tool 3: Product Suggestion
const productSuggestion = tool(
  async function productSuggestionTool(prompt: string) {
    // Logic to generate product suggestions
    return `You might want to consider these products for: ${prompt}`;
  },
  {
    name: "product_suggestion",
    description: "This tool suggests products related to the user's query.",
  }
);

// Tool 4: Guidance for Project
const guidanceForProject = tool(
  async function guidanceForProjectTool(prompt: string) {
    // Logic to provide project guidance
    return `Here's some guidance for your project regarding: ${prompt}`;
  },
  {
    name: "guidance_for_project",
    description: "This tool offers guidance for user projects.",
  }
);

// Tool 5: Budget Planning
const budgetPlanning = tool(
  async function budgetPlanningTool(prompt: string) {
    // Logic for budget planning
    return `Here are some budget planning tips for: ${prompt}`;
  },
  {
    name: "budget_planning",
    description: "This tool helps users plan their budget for projects.",
  }
);

// Tool 6: Project Time Estimation
const projectTimeEstimation = tool(
  async function projectTimeEstimationTool(prompt: string) {
    // Logic for estimating project time
    return `Estimated time for your project: ${prompt}`;
  },
  {
    name: "project_time_estimation",
    description: "This tool estimates the time required for a project.",
  }
);

// Exporting all tools as an array for use in the main application
export const tools = [
  normalAdvice,
  communitySuggestion,
  productSuggestion,
  guidanceForProject,
  budgetPlanning,
  projectTimeEstimation,
];
