import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, LinearProgress, ButtonBase, Avatar,
  Skeleton, Modal, TextField, Button, Alert, MenuItem, useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

import TvIcon from "@mui/icons-material/Tv";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import SchoolIcon from "@mui/icons-material/School";
import SavingsIcon from "@mui/icons-material/Savings";
import AddIcon from "@mui/icons-material/Add";
import BottomNav from "../components/BottomNav";

const ICON_MAP = {
  tv:      { icon: <TvIcon />,                   bg: "#fff3e0", color: "#e65100" },
  medical: { icon: <MedicalInformationIcon />,    bg: "#e0f2f1", color: "#00796b" },
  school:  { icon: <SchoolIcon />,               bg: "#fff8e1", color: "#b57c1e" },
  savings: { icon: <SavingsIcon />,              bg: "#f3e5f5", color: "#6a0dad" },
};

const ICON_OPTIONS = [
  { value: "savings", label: "Default Savings" },
  { value: "tv",      label: "Electronics / TV" },
  { value: "medical", label: "Emergency / Health" },
  { value: "school",  label: "Education / Fees" },
];

const roundedField = { "& .MuiOutlinedInput-root": { borderRadius: "14px" } };

export default function SavingsView() {
  const navigate = useNavigate();
  const theme    = useTheme();

  const [goals, setGoals]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Deposit modal
  const [depositOpen, setDepositOpen] = useState(false);
  const [activeGoal, setActiveGoal]   = useState(null);
  const [depositAmt, setDepositAmt]   = useState("");
  const [depositNote, setDepositNote] = useState("");
  const [depositBusy, setDepositBusy] = useState(false);

  // Create goal modal
  const [goalOpen, setGoalOpen]       = useState(false);
  const [goalTitle, setGoalTitle]     = useState("");
  const [goalTarget, setGoalTarget]   = useState("");
  const [goalIcon, setGoalIcon]       = useState("savings");
  const [goalDeadline, setGoalDeadline] = useState("2026-12-31");
  const [goalBusy, setGoalBusy]       = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await client.get("/savings");
      setGoals(res.data?.data?.goals || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to load savings goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(depositAmt);
    if (!amount || amount <= 0) return;
    setDepositBusy(true);
    try {
      await client.post(`/savings/${activeGoal.id}/deposit`, {
        amount,
        note: depositNote.trim() || "Saved from wages",
      });
      setDepositOpen(false);
      setDepositAmt("");
      setDepositNote("");
      fetchGoals();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Deposit failed.");
    } finally {
      setDepositBusy(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalTarget) return;
    setGoalBusy(true);
    try {
      await client.post("/savings", {
        title: goalTitle.trim(),
        target_amount: parseFloat(goalTarget),
        icon: goalIcon,
        deadline: goalDeadline,
      });
      setGoalOpen(false);
      setGoalTitle("");
      setGoalTarget("");
      setGoalIcon("savings");
      fetchGoals();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create goal.");
    } finally {
      setGoalBusy(false);
    }
  };

  const safeGoals  = Array.isArray(goals) ? goals : [];
  const totalSaved = safeGoals.reduce(
    (acc, g) => acc + (Number(g.saved_amount) || 0), 0
  );

  // Modal Paper sx — uses theme so it adapts to dark mode
  const modalPaperSx = {
    p: 4, borderRadius: "28px", maxWidth: 420, width: "100%", outline: "none",
    bgcolor: "background.paper",
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 12 }}>

      {/* Header */}
      <Box sx={{ bgcolor: "#6a0dad", color: "#fff", pt: 6, pb: 4, px: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>Savings goals</Typography>
          <Avatar
            variant="rounded"
            onClick={() => navigate('/income')}
            sx={{ bgcolor: "rgba(255,255,255,0.15)", width: 40, height: 40, borderRadius: "12px", cursor: "pointer" }}
          >
            <AddIcon />
          </Avatar>
        </Box>

        <Box sx={{ bgcolor: "rgba(255,255,255,0.1)", p: 2.5, borderRadius: "20px" }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>Total saved</Typography>
          {loading ? (
            <Skeleton variant="text" width={120} height={48} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
          ) : (
            <Typography variant="h3" sx={{ fontWeight: "bold", my: 0.5 }}>
              K {totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Typography>
          )}
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {loading ? "Calculating..." : `Across ${safeGoals.length} active goal${safeGoals.length !== 1 ? "s" : ""}`}
          </Typography>
        </Box>
      </Box>

      {/* Goals list */}
      <Box sx={{ px: 2, mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>

        {errorMsg && (
          <Alert severity="error" onClose={() => setErrorMsg("")}>{errorMsg}</Alert>
        )}

        {/* Skeletons */}
        {loading && [1, 2, 3].map((i) => (
          <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: "24px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "14px" }} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
            </Box>
            <Skeleton variant="rectangular" height={8} sx={{ borderRadius: "4px" }} />
          </Paper>
        ))}

        {/* Empty state */}
        {!loading && safeGoals.length === 0 && (
          <Paper elevation={0} sx={{ p: 4, borderRadius: "24px", border: "1px solid", borderColor: "divider", textAlign: "center", bgcolor: "background.paper" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No active goals yet. Create one below!
            </Typography>
          </Paper>
        )}

        {/* Goal cards */}
        {!loading && safeGoals.map((goal) => {
          const saved      = Number(goal.saved_amount) || 0;
          const target     = Number(goal.target_amount) || 1;
          const percentage = Math.min(Math.round((saved / target) * 100), 100);
          const toGo       = Math.max(target - saved, 0);
          const style      = ICON_MAP[goal.icon?.toLowerCase()] ?? ICON_MAP.savings;

          return (
            <Paper
              key={goal.id}
              elevation={0}
              onClick={() => { setActiveGoal(goal); setDepositOpen(true); }}
              sx={{
                p: 2.5, borderRadius: "24px", cursor: "pointer",
                border: "1px solid", borderColor: "divider",
                bgcolor: "background.paper",
                display: "flex", flexDirection: "column", gap: 1.5,
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.01)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar variant="rounded" sx={{ bgcolor: style.bg, width: 44, height: 44, borderRadius: "14px", color: style.color }}>
                    {style.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                      {goal.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                      Target: K {target.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: "bold", color: style.color }}>
                  K {saved.toLocaleString()}
                </Typography>
              </Box>

              <Box>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 8, borderRadius: "4px",
                    bgcolor: theme.palette.mode === "dark" ? "#2e2e2e" : "#f2eae4",
                    "& .MuiLinearProgress-bar": { bgcolor: style.color },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: style.color }}>
                    {percentage}% saved
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    K {toGo.toLocaleString()} to go
                  </Typography>
                </Box>
              </Box>
            </Paper>
          );
        })}

        {/* Add goal button */}
        <ButtonBase
          onClick={() => setGoalOpen(true)}
          sx={{
            width: "100%", p: 2.2, borderRadius: "20px",
            bgcolor: theme.palette.mode === "dark" ? "rgba(106,13,173,0.15)" : "#f3e5f5",
            border: "1px dashed #6a0dad",
            color: "#6a0dad", fontWeight: "bold", fontSize: "1rem",
            display: "flex", justifyContent: "center", alignItems: "center", gap: 1,
            "&:hover": { bgcolor: theme.palette.mode === "dark" ? "rgba(106,13,173,0.25)" : "#e1bee7" },
          }}
        >
          <AddIcon sx={{ fontSize: "1.3rem" }} />
          Add new goal
        </ButtonBase>
      </Box>

      {/* Deposit modal */}
      <Modal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
      >
        <Paper component="form" onSubmit={handleDeposit} sx={modalPaperSx}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}>
            Deposit to {activeGoal?.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, textAlign: "center" }}>
            How much cash are you putting aside right now?
          </Typography>
          <TextField
            fullWidth required type="number" label="Amount (ZMW)"
            value={depositAmt} onChange={(e) => setDepositAmt(e.target.value)}
            inputProps={{ min: 0, step: "0.01" }} sx={{ mb: 2, ...roundedField }}
          />
          <TextField
            fullWidth label="Note" placeholder="e.g. Saved from weekly wages"
            value={depositNote} onChange={(e) => setDepositNote(e.target.value)}
            sx={{ mb: 3, ...roundedField }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button fullWidth variant="outlined" onClick={() => setDepositOpen(false)}
              sx={{ borderRadius: "14px", textTransform: "none" }}>
              Cancel
            </Button>
            <Button fullWidth type="submit" variant="contained" disabled={depositBusy}
              sx={{ borderRadius: "14px", textTransform: "none", bgcolor: "#6a0dad", "&:hover": { bgcolor: "#4a067d" } }}>
              {depositBusy ? "Saving..." : "Confirm"}
            </Button>
          </Box>
        </Paper>
      </Modal>

      {/* Create goal modal */}
      <Modal
        open={goalOpen}
        onClose={() => setGoalOpen(false)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
      >
        <Paper component="form" onSubmit={handleCreateGoal} sx={modalPaperSx}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}>
            Create saving goal
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, textAlign: "center" }}>
            Set a clear milestone to motivate regular savings.
          </Typography>
          <TextField
            fullWidth required label="Goal Title" placeholder="e.g. Buying a plot / Fridge"
            value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)}
            sx={{ mb: 2, ...roundedField }}
          />
          <TextField
            fullWidth required type="number" label="Target Amount (K)"
            value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)}
            inputProps={{ min: 0, step: "0.01" }} sx={{ mb: 2, ...roundedField }}
          />
          <TextField
            fullWidth select label="Visual Icon"
            value={goalIcon} onChange={(e) => setGoalIcon(e.target.value)}
            sx={{ mb: 2, ...roundedField }}
          >
            {ICON_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth required type="date" label="Deadline"
            value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ mb: 4, ...roundedField }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button fullWidth variant="outlined" onClick={() => setGoalOpen(false)}
              sx={{ borderRadius: "14px", textTransform: "none" }}>
              Cancel
            </Button>
            <Button fullWidth type="submit" variant="contained" disabled={goalBusy}
              sx={{ borderRadius: "14px", textTransform: "none", bgcolor: "#6a0dad", "&:hover": { bgcolor: "#4a067d" } }}>
              {goalBusy ? "Creating..." : "Create Goal"}
            </Button>
          </Box>
        </Paper>
      </Modal>

      <BottomNav />
    </Box>
  );
}