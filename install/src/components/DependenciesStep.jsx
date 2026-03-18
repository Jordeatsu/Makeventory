import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, LinearProgress, Paper, Chip, Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon       from '@mui/icons-material/Error';
import FolderIcon      from '@mui/icons-material/Folder';

const PACKAGES = [
  { id: 'install', label: 'Installer',        desc: 'install/' },
  { id: 'client',  label: 'Client (React)',    desc: 'client/'  },
  { id: 'server',  label: 'Server (Node.js)',  desc: 'server/'  },
];

function PackageRow({ label, desc, status }) {
  const isRunning  = status === 'running';
  const isComplete = status === 'complete';
  const isError    = status === 'error';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 1.5,
        bgcolor: isComplete ? 'rgba(52,211,153,0.05)'  :
                 isError    ? 'rgba(248,113,113,0.05)' :
                              'rgba(255,255,255,0.02)',
        borderColor: isComplete ? 'rgba(52,211,153,0.3)'   :
                     isError    ? 'rgba(248,113,113,0.3)'  :
                     isRunning  ? 'rgba(96,165,250,0.3)'   :
                                  'rgba(255,255,255,0.08)',
        borderRadius: 2,
        transition: 'border-color 0.4s, background-color 0.4s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight={500}>{label}</Typography>
          <Typography variant="caption" color="text.disabled"
            sx={{ fontFamily: '"Roboto Mono", monospace', fontSize: '0.7rem' }}>
            {desc}
          </Typography>
        </Box>

        {isComplete && <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} />}
        {isError    && <ErrorIcon       sx={{ color: 'error.main',   fontSize: 18 }} />}
        {isRunning  && (
          <Chip label="Installing…" size="small" color="primary" variant="outlined"
            sx={{ fontSize: '0.7rem', height: 20 }} />
        )}
        {status === 'pending' && (
          <Chip label="Waiting" size="small" variant="outlined"
            sx={{ fontSize: '0.7rem', height: 20, borderColor: 'text.disabled', color: 'text.disabled' }} />
        )}
      </Box>

      <LinearProgress
        variant={isRunning ? 'indeterminate' : 'determinate'}
        value={isRunning ? undefined : (isComplete ? 100 : 0)}
        color={isComplete ? 'success' : isError ? 'error' : 'primary'}
        sx={{ borderRadius: 4, height: 6 }}
      />

      {isError && (
        <Typography variant="caption" color="error.main" sx={{ mt: 0.75, display: 'block' }}>
          Installation failed. Check your connection and re-run <code>./install.sh</code>.
        </Typography>
      )}
    </Paper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DependenciesStep({ alreadyComplete, onComplete }) {
  const [jobs, setJobs] = useState({
    install: { status: 'complete' },
    client:  { status: 'pending'  },
    server:  { status: 'pending'  },
  });

  // Prevent double-firing onComplete when the user navigates back to a finished step
  const calledComplete = useRef(alreadyComplete);

  useEffect(() => {
    const es = new EventSource('/api/npm-progress');

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setJobs(data);

        const allDone  = data.client.status === 'complete' && data.server.status === 'complete';
        const anyError = data.client.status === 'error'    || data.server.status === 'error';

        if ((allDone || anyError) && !calledComplete.current) {
          calledComplete.current = true;
          if (allDone) setTimeout(() => onComplete(), 900);
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // Connection closed — server may have already finished; check final state
      setJobs((prev) => {
        const allDone = prev.client.status === 'complete' && prev.server.status === 'complete';
        if (allDone && !calledComplete.current) {
          calledComplete.current = true;
          setTimeout(() => onComplete(), 900);
        }
        return prev;
      });
    };

    return () => es.close();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allComplete = jobs.client.status === 'complete' && jobs.server.status === 'complete';
  const anyError    = jobs.client.status === 'error'    || jobs.server.status === 'error';

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Installing Dependencies</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        npm packages are being installed for each part of Makeventory. This usually takes under
        a minute.
      </Typography>

      {PACKAGES.map(({ id, label, desc }) => (
        <PackageRow
          key={id}
          label={label}
          desc={desc}
          status={jobs[id]?.status ?? 'pending'}
        />
      ))}

      {allComplete && (
        <Alert severity="success" sx={{ mt: 2 }}>
          All packages installed — moving to Database Setup…
        </Alert>
      )}

      {anyError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          One or more packages failed to install. Check your network connection and
          re-run <code style={{ fontFamily: 'monospace' }}>./install.sh</code>.
        </Alert>
      )}
    </Box>
  );
}
