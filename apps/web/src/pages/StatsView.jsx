import React, { useState, useEffect } from 'react';
import { Box, Typography, ButtonBase, Paper, LinearProgress, Skeleton, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import client from '../api/client';
import BottomNav from '../components/BottomNav';

const CATEGORY_STYLE_MAP = {
  food:          { label: 'Food',      color: '#D74205' },
  home:          { label: 'Home/Rent', color: '#1565c0' },
  phone:         { label: 'Phone',     color: '#00a572' },
  transport:     { label: 'Transport', color: '#7b1fa2' },
  savings:       { label: 'Savings',   color: '#6a0dad' },
  miscellaneous: { label: 'Misc',      color: '#757575' },
};

const ALL_12_MONTHS = [
  { label: 'Jan', index: 1  }, { label: 'Feb', index: 2  },
  { label: 'Mar', index: 3  }, { label: 'Apr', index: 4  },
  { label: 'May', index: 5  }, { label: 'Jun', index: 6  },
  { label: 'Jul', index: 7  }, { label: 'Aug', index: 8  },
  { label: 'Sep', index: 9  }, { label: 'Oct', index: 10 },
  { label: 'Nov', index: 11 }, { label: 'Dec', index: 12 },
];

export default function StatsView() {
  const theme              = useTheme();
  const currentYear        = new Date().getFullYear();
  const currentMonthIndex  = new Date().getMonth() + 1;

  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
  const [loading, setLoading]             = useState(true);
  const [breakdown, setBreakdown]         = useState([]);
  const [totalSpent, setTotalSpent]       = useState(0);

  useEffect(() => {
    setLoading(true);
    client.get('/expenses/summary', {
      params: { month: selectedMonth, year: currentYear }
    })
      .then((res) => {
        const payload = res.data?.data;
        setBreakdown(payload?.breakdown || []);
        setTotalSpent(parseFloat(payload?.total || 0));
      })
      .catch((err) => {
        console.error('Stats fetch failed:', err);
        setBreakdown([]);
        setTotalSpent(0);
      })
      .finally(() => setLoading(false));
  }, [selectedMonth]);

  const chartData = breakdown.map((item) => {
    const key    = item.category?.toLowerCase() || 'miscellaneous';
    const config = CATEGORY_STYLE_MAP[key] || CATEGORY_STYLE_MAP.miscellaneous;
    const amount = parseFloat(item.total || 0);
    return {
      label:      config.label,
      value:      amount,
      color:      config.color,
      percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
    };
  });

  const activeLabel = ALL_12_MONTHS.find(m => m.index === selectedMonth)?.label;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}>

      {/* Header */}
      <Box sx={{ bgcolor: '#00a572', color: '#fff', pt: 6, pb: 4, px: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Where's your money going?
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          {loading
            ? 'Loading...'
            : `${activeLabel} ${currentYear} · K ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })} spent`}
        </Typography>
      </Box>

      {/* Month tabs */}
      <Box sx={{
        display: 'flex', gap: 1.5, p: 2, overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': { display: 'none' },
      }}>
        {ALL_12_MONTHS.map((m) => {
          const active = selectedMonth === m.index;
          return (
            <ButtonBase
              key={m.index}
              onClick={() => setSelectedMonth(m.index)}
              sx={{
                px: 2.5, py: 1, borderRadius: '20px', flexShrink: 0,
                border: '1px solid',
                borderColor: active ? '#00a572' : 'divider',
                bgcolor: active ? '#00a572' : 'background.paper',
                color: active ? '#fff' : 'text.secondary',
                fontWeight: 'bold', fontSize: '0.85rem',
              }}
            >
              {m.label}
            </ButtonBase>
          );
        })}
      </Box>

      {/* Donut + Legend */}
      <Paper elevation={0} sx={{
        mx: 2, p: 3, borderRadius: '24px',
        bgcolor: 'background.paper',
        border: '1px solid', borderColor: 'divider',
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Skeleton variant="circular" width={130} height={130} />
            <Box sx={{ flex: 1 }}>
              {[1, 2, 3].map(i => <Skeleton key={i} variant="text" sx={{ mb: 0.5 }} />)}
            </Box>
          </Box>
        ) : chartData.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No expenses recorded for {activeLabel}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

            {/* Donut with centre label */}
            <Box sx={{ position: 'relative', flexShrink: 0, width: 130, height: 130 }}>
              <PieChart
                series={[{
                  data: chartData.map(d => ({ id: d.label, value: d.value, color: d.color })),
                  innerRadius: 42,
                  outerRadius: 62,
                  paddingAngle: 2,
                  cornerRadius: 4,
                }]}
                slotProps={{ legend: { hidden: true } }}
                width={130}
                height={130}
                margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
              />
              <Box sx={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'text.primary', lineHeight: 1 }}>
                  K {totalSpent.toFixed(0)}
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                  total
                </Typography>
              </Box>
            </Box>

            {/* Legend */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, flex: 1 }}>
              {chartData.map((item) => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    K {item.value.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>

          </Box>
        )}
      </Paper>

      {/* Spending breakdown bars */}
      <Box sx={{ px: 2, mt: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 2 }}>
          Spending breakdown
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {loading ? (
            [1, 2, 3].map(i => (
              <Box key={i}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="rectangular" height={8} sx={{ borderRadius: '4px', mt: 0.5 }} />
              </Box>
            ))
          ) : chartData.length === 0 ? (
            <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
              No data for this month
            </Typography>
          ) : (
            chartData.map((item) => (
              <Box key={item.label}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    K {item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
                    <span style={{ color: theme.palette.text.disabled, fontWeight: 'normal', fontSize: '0.8rem' }}>
                      {item.percentage}%
                    </span>
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.percentage}
                  sx={{
                    height: 8, borderRadius: '4px',
                    bgcolor: theme.palette.mode === 'dark' ? '#2e2e2e' : '#f0e6df',
                    '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: '4px' },
                  }}
                />
              </Box>
            ))
          )}
        </Box>
      </Box>

      <BottomNav />
    </Box>
  );
}