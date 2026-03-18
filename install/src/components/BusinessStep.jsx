import React, { useState, useRef } from 'react';
import {
  Box, Typography, TextField, Button, CircularProgress,
  Alert, Grid, Avatar, Tooltip,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { createBusiness } from '../api';

const EMPTY = {
  businessName: '',
  website: '',
  twitter: '',
  instagram: '',
  tiktok: '',
  facebook: '',
};

const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[^\s]*)?$/i;

function urlError(val, label) {
  if (!val.trim()) return '';
  if (!URL_RE.test(val.trim())) return `Enter a valid URL for ${label}.`;
  return '';
}

function normaliseUrl(val) {
  if (!val.trim()) return '';
  return val.trim().startsWith('http') ? val.trim() : `https://${val.trim()}`;
}

export default function BusinessStep({ onComplete, savedData, onSave }) {
  const [fields, setFields] = useState(
    savedData
      ? { businessName: savedData.businessName, website: savedData.website || '', twitter: savedData.twitter || '', instagram: savedData.instagram || '', tiktok: savedData.tiktok || '', facebook: savedData.facebook || '' }
      : EMPTY
  );
  const [errors,      setErrors]      = useState({});
  const [logo,        setLogo]        = useState(savedData?.logo ?? null);
  const [submitting,  setSubmitting]  = useState(false);
  const [serverError, setServerError] = useState('');
  const [done,        setDone]        = useState(false);

  const isUpdate = !!savedData;

  const fileRef = useRef();

  const set = (field) => (e) =>
    setFields((prev) => ({ ...prev, [field]: e.target.value }));

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, logo: 'Please select an image file.' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, logo: 'Logo must be under 2 MB.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1];
      setLogo({ base64, mime: file.type, preview: ev.target.result });
      setErrors((prev) => ({ ...prev, logo: '' }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!fields.businessName.trim()) e.businessName = 'Business name is required.';
    ['website','twitter','instagram','tiktok','facebook'].forEach((k) => {
      const msg = urlError(fields[k], k.charAt(0).toUpperCase() + k.slice(1));
      if (msg) e[k] = msg;
    });
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await createBusiness({
        businessName: fields.businessName.trim(),
        ...(logo && { logoBase64: logo.base64, logoMime: logo.mime }),
        website:   normaliseUrl(fields.website),
        twitter:   normaliseUrl(fields.twitter),
        instagram: normaliseUrl(fields.instagram),
        tiktok:    normaliseUrl(fields.tiktok),
        facebook:  normaliseUrl(fields.facebook),
      });
      onSave?.({
        businessName: fields.businessName.trim(),
        website:   normaliseUrl(fields.website),
        twitter:   normaliseUrl(fields.twitter),
        instagram: normaliseUrl(fields.instagram),
        tiktok:    normaliseUrl(fields.tiktok),
        facebook:  normaliseUrl(fields.facebook),
        logo,
      });
      setDone(true);
      setTimeout(onComplete, 800);
    } catch (err) {
      setServerError(err.response?.data?.error ?? err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" gutterBottom>Business Profile</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tell Makeventory about your business. Only the business name is required.
      </Typography>

      <Grid container spacing={2}>
        {/* Business Name */}
        <Grid item xs={12}>
          <TextField
            label="Business Name"
            value={fields.businessName}
            onChange={set('businessName')}
            error={!!errors.businessName}
            helperText={errors.businessName || ' '}
            fullWidth required size="small"
            disabled={submitting || done}
          />
        </Grid>

        {/* Logo upload */}
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
            Company Logo <Typography component="span" variant="caption" color="text.disabled">(optional, max 2 MB)</Typography>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={logo?.preview}
              variant="rounded"
              sx={{ width: 72, height: 72, bgcolor: 'divider', border: '1px solid', borderColor: 'divider' }}
            >
              {!logo && <UploadFileIcon sx={{ color: 'text.disabled' }} />}
            </Avatar>
            <Box>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleLogoChange}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => fileRef.current.click()}
                disabled={submitting || done}
              >
                {logo ? 'Change Logo' : 'Upload Logo'}
              </Button>
              {logo && (
                <Button
                  size="small"
                  color="error"
                  sx={{ ml: 1 }}
                  onClick={() => { setLogo(null); fileRef.current.value = ''; }}
                  disabled={submitting || done}
                >
                  Remove
                </Button>
              )}
              {errors.logo && (
                <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5 }}>
                  {errors.logo}
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Website */}
        <Grid item xs={12}>
          <TextField
            label="Company Website"
            placeholder="https://example.com"
            value={fields.website}
            onChange={set('website')}
            error={!!errors.website}
            helperText={errors.website || ' '}
            fullWidth size="small"
            disabled={submitting || done}
          />
        </Grid>

        {/* Social links */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Twitter / X Handle"
            placeholder="https://twitter.com/yourbusiness"
            value={fields.twitter}
            onChange={set('twitter')}
            error={!!errors.twitter}
            helperText={errors.twitter || ' '}
            fullWidth size="small"
            disabled={submitting || done}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Instagram Handle"
            placeholder="https://instagram.com/yourbusiness"
            value={fields.instagram}
            onChange={set('instagram')}
            error={!!errors.instagram}
            helperText={errors.instagram || ' '}
            fullWidth size="small"
            disabled={submitting || done}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="TikTok Handle"
            placeholder="https://tiktok.com/@yourbusiness"
            value={fields.tiktok}
            onChange={set('tiktok')}
            error={!!errors.tiktok}
            helperText={errors.tiktok || ' '}
            fullWidth size="small"
            disabled={submitting || done}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Facebook Page"
            placeholder="https://facebook.com/yourbusiness"
            value={fields.facebook}
            onChange={set('facebook')}
            error={!!errors.facebook}
            helperText={errors.facebook || ' '}
            fullWidth size="small"
            disabled={submitting || done}
          />
        </Grid>
      </Grid>

      {serverError && (
        <Alert severity="error" sx={{ mt: 2 }}>{serverError}</Alert>
      )}

      {done && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {isUpdate ? 'Business profile updated — moving to the next step…' : 'Business profile saved — moving to the next step…'}
        </Alert>
      )}

      {!done && (
        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{ minWidth: 160 }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : isUpdate ? 'Update Business Profile' : 'Save Business Profile'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
