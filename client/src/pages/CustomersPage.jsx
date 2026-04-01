import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Paper, Stack, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import api from "../api";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import CustomerFormModal from "../components/modals/CustomerFormModal";
import { useCurrencyFormatter, fmtDate } from "../utils/formatting";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "react-i18next";
import ToastSnackbar from "../components/common/ToastSnackbar";

export default function CustomersPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { settings } = useGlobalSettings();
    const fmt = useCurrencyFormatter(settings);
    const { toast, showToast, closeToast } = useToast();

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [tab, setTab] = useState(1);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [colSettings, setColSettings] = useState({});

    // Load column visibility settings
    useEffect(() => {
        api.get("/settings/customers")
            .then(({ data }) => {
                setColSettings(data?.settings?.tableColumns ?? {});
            })
            .catch(() => {});
    }, []);

    const col = (key) => colSettings[key] !== false;

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/customers", { params: search ? { search } : {} });
            setCustomers(data.customers ?? []);
        } catch {
            setError(t("customers.loadError"));
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSave = async (form) => {
        try {
            if (editing?._id) {
                await api.put(`/customers/${editing._id}`, form);
                showToast(t("customers.updated"));
            } else {
                await api.post("/customers", form);
                showToast(t("customers.created"));
            }
            setDialogOpen(false);
            setEditing(null);
            load();
        } catch (e) {
            showToast(e.response?.data?.error || t("customers.saveFailed"), "error");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/customers/${deleteTarget._id}`);
            showToast(t("customers.deleted"), "info");
            setDeleteTarget(null);
            load();
        } catch {
            showToast(t("customers.deleteFailed"), "error");
            setDeleteTarget(null);
        }
    };

    const groupedByLetter = useMemo(() => {
        const groups = {};
        customers.forEach((c) => {
            const firstChar = c.name?.charAt(0).toUpperCase() || "#";
            const letter = /[A-Z]/.test(firstChar) ? firstChar : "#";
            if (!groups[letter]) groups[letter] = { letter, customers: [] };
            groups[letter].customers.push(c);
        });
        return Object.values(groups).sort((a, b) => (a.letter === "#" ? 1 : b.letter === "#" ? -1 : a.letter.localeCompare(b.letter)));
    }, [customers]);

    const tableHead = (
        <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 600, bgcolor: "background.default" } }}>
                <TableCell>{t("customers.col.customer")}</TableCell>
                {col("location") && <TableCell>{t("customers.col.location")}</TableCell>}
                {col("orders") && <TableCell align="center">{t("customers.col.orders")}</TableCell>}
                {col("totalSpent") && <TableCell align="right">{t("customers.col.totalSpent")}</TableCell>}
                {col("totalProfit") && <TableCell align="right">{t("customers.col.totalProfit")}</TableCell>}
                {col("firstOrder") && <TableCell>{t("customers.col.firstOrder")}</TableCell>}
                {col("lastOrder") && <TableCell>{t("customers.col.lastOrder")}</TableCell>}
                <TableCell align="right">{t("customers.col.actions")}</TableCell>
            </TableRow>
        </TableHead>
    );

    const renderRow = (c) => (
        <TableRow key={c._id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/customers/${c._id}`)}>
            <TableCell>
                <Typography variant="body2" fontWeight={600}>
                    {c.name}
                </Typography>
                {c.email && (
                    <Typography variant="caption" color="text.secondary" display="block">
                        {c.email}
                    </Typography>
                )}
            </TableCell>
            {col("location") && (
                <TableCell>
                    <Typography variant="body2">{[c.city, c.state, c.postcode, c.country].filter(Boolean).join(", ") || "—"}</Typography>
                </TableCell>
            )}
            {col("orders") && (
                <TableCell align="center">
                    <Chip label={c.orderCount} size="small" color={c.orderCount > 1 ? "success" : "default"} variant={c.orderCount > 1 ? "filled" : "outlined"} />
                    {c.orderCount > 1 && (
                        <Typography variant="caption" color="success.main" display="block">
                            {t("customers.returning")}
                        </Typography>
                    )}
                </TableCell>
            )}
            {col("totalSpent") && (
                <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                        {fmt(c.totalSpent)}
                    </Typography>
                </TableCell>
            )}
            {col("totalProfit") && (
                <TableCell align="right">
                    <Typography variant="body2" fontWeight={500} color={c.totalProfit >= 0 ? "success.main" : "error.main"}>
                        {fmt(c.totalProfit)}
                    </Typography>
                </TableCell>
            )}
            {col("firstOrder") && (
                <TableCell>
                    <Typography variant="body2">{fmtDate(c.firstOrder)}</Typography>
                </TableCell>
            )}
            {col("lastOrder") && (
                <TableCell>
                    <Typography variant="body2">{fmtDate(c.lastOrder)}</Typography>
                </TableCell>
            )}
            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title={t("common.view")}>
                        <IconButton size="small" onClick={() => navigate(`/customers/${c._id}`)}>
                            <ArrowForwardIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t("common.edit")}>
                        <IconButton
                            size="small"
                            onClick={() => {
                                setEditing(c);
                                setDialogOpen(true);
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t("common.delete")}>
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(c)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </TableCell>
        </TableRow>
    );

    return (
        <Box>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} mb={3} gap={2}>
                <Box>
                    <Typography variant="h4">{t("customers.title")}</Typography>
                    <Typography color="text.secondary" variant="body2">
                        {t("customers.subtitle")}
                    </Typography>
                </Box>
                <Stack direction="row" gap={1} alignItems="center">
                    <Chip icon={<PeopleIcon />} label={t("customers.count", { count: customers.length })} color="primary" variant="outlined" />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setEditing(null);
                            setDialogOpen(true);
                        }}
                    >
                        {t("customers.newCustomer")}
                    </Button>
                </Stack>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            <Stack direction="row" gap={2} mb={3}>
                <TextField
                    placeholder={t("customers.searchPlaceholder")}
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ minWidth: 280 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Stack>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab label={t("customers.tabs.all")} />
                    <Tab label={t("customers.tabs.byLetter")} />
                </Tabs>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : customers.length === 0 ? (
                <Paper sx={{ py: 8, textAlign: "center" }}>
                    <PeopleIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                    <Typography color="text.secondary">{search ? t("customers.noResults") : t("customers.noCustomers")}</Typography>
                </Paper>
            ) : tab === 0 ? (
                /* ── Tab 0: All Customers ── */
                <TableContainer component={Paper}>
                    <Table size="small">
                        {tableHead}
                        <TableBody>{customers.map(renderRow)}</TableBody>
                    </Table>
                </TableContainer>
            ) : (
                /* ── Tab 1: By Letter ── */
                groupedByLetter.map(({ letter, customers: grpCustomers }) => (
                    <Box key={letter} sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                            {letter}
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                {tableHead}
                                <TableBody>{grpCustomers.map(renderRow)}</TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                ))
            )}

            <CustomerFormModal
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setEditing(null);
                }}
                onSave={handleSave}
                initial={editing}
            />

            {/* Delete confirmation */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>{t("customers.delete.title")}</DialogTitle>
                <DialogContent>
                    <Typography>{t("customers.delete.confirm", { name: deleteTarget?.name })}</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)} color="inherit">
                        {t("common.cancel")}
                    </Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>
                        {t("common.delete")}
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastSnackbar toast={toast} onClose={closeToast} />
        </Box>
    );
}
