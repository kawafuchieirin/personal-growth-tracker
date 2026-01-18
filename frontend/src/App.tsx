import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Dashboard } from "@/pages/Dashboard";
import { GoalsPage, GoalDetailPage } from "@/pages/Goals";
import { HabitsPage } from "@/pages/Habits";
import { SkillsPage } from "@/pages/Skills";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/goals/:goalId" element={<GoalDetailPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/skills" element={<SkillsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
