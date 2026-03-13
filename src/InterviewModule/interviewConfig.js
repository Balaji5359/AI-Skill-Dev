export const INTERVIEW_MODULES = {
  self_introduction: {
    id: 1,
    title: "Self Introduction",
    practiceKey: "self_introduction_practice",
    testKey: "self_introduction_test",
    shortCode: "self_intro",
    scoreLabel: "Self-Introduction Score",
  },
  programming_knowledge: {
    id: 2,
    title: "Programming Knowledge",
    practiceKey: "programming_knowledge_practice",
    testKey: "programming_knowledge_test",
    shortCode: "programming",
    scoreLabel: "Programming Knowledge Score",
  },
  worked_domain: {
    id: 3,
    title: "Worked Domain",
    practiceKey: "worked_domain_practice",
    testKey: "worked_domain_test",
    shortCode: "domain",
    scoreLabel: "Domain Expertise Score",
  },
  project_discussion: {
    id: 4,
    title: "Project Discussion",
    practiceKey: "project_discussion_practice",
    testKey: "project_discussion_test",
    shortCode: "project",
    scoreLabel: "Project Discussion Score",
  },
  future_career_planning: {
    id: 5,
    title: "Future Career Planning",
    practiceKey: "future_career_planning_practice",
    testKey: "future_career_planning_test",
    shortCode: "career",
    scoreLabel: "Career Planning Score",
  },
  hobbies_interests: {
    id: 6,
    title: "Hobbies & Interests",
    practiceKey: "hobbies_interests_practice",
    testKey: "hobbies_interests_test",
    shortCode: "hobbies",
    scoreLabel: "Hobbies & Interests Score",
  },
  certifications_exploration: {
    id: 7,
    title: "Certifications Exploration",
    practiceKey: "certifications_exploration_practice",
    testKey: "certifications_exploration_test",
    shortCode: "certifications",
    scoreLabel: "Certifications Exploration Score",
  },
};

export const INTERVIEW_ID_TO_MODULE = Object.values(INTERVIEW_MODULES).reduce((acc, module) => {
  acc[module.id] = module;
  return acc;
}, {});

export const getInterviewModuleByKey = (interviewKey = "") =>
  Object.values(INTERVIEW_MODULES).find(
    (module) => module.practiceKey === interviewKey || module.testKey === interviewKey,
  ) || null;

export const getInterviewModuleById = (id) => INTERVIEW_ID_TO_MODULE[id] || null;
