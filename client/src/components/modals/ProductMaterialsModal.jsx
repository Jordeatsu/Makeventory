import React, { useState, useEffect, useCallback } from "react";
import { Alert, Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../api";
import { useGlobalSettings } from "../../context/GlobalSettingsContext";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };
export default function ProductMaterialsModal({ open, onClose, product }) {
    const { settings } = useGlobalSettings();
    const sym = CURRENCY_SYMBOLS[settings?.currency] ?? "£";

    const [rows, setRows] = useState([]);
    const [allMats, setAllMats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Add-row state
    const [newMat, setNewMat] = useState(null);
    const [newQty, setNewQty] = useState("");
    const [addError, setAddError] = useState("");
    const [adding, setAdding] = useState(false);

    // Inline-edit state: { id, qty }
    const [editing, setEditing] = useState(null);
    const [editErr, setEditErr] = useState("");

    const load = useCallback(() => {
        if (!product?._id) return;
        setLoading(true);
        setError("");
        api.get("/product-materials", { params: { productId: product._id } })
            .then((r) => setRows(r.data.productMaterials ?? []))
            .catch(() => setError("Could not load materials."))
            .finally(() => setLoading(false));
    }, [product?._id]);

    useEffect(() => {
        if (!open) return;
        load();
        api.get("/materials")
            .then((r) => setAllMats(r.data.materials ?? []))
            .catch(() => {});
    }, [open, load]);

    // Reset add-row when modal closes
    useEffect(() => {
        if (!open) {
            setNewMat(null);
            setNewQty("");
            setAddError("");
            setEditing(null);
            setEditErr("");
        }
    }, [open]);

    const handleAdd = async () => {
        setAddError("");
        if (!newMat) {
            setAddError("Select a material.");
            return;
        }
        const qty = parseFloat(newQty);
        if (!qty || qty <= 0) {
            setAddError("Enter a valid quantity.");
            return;
        }
        setAdding(true);
        try {
            await api.post("/product-materials", {
                productId: product._id,
                materialId: newMat._id,
                materialQuantityUsed: qty,
            });
            setNewMat(null);
            setNewQty("");
            load();
        } catch (e) {
            setAddError(e?.response?.data?.error ?? "Could not add material.");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/product-materials/${id}`);
            load();
        } catch {
            setError("Could not remove material.");
        }
    };

    const startEdit = (row) => {
        setEditing({ id: row._id, qty: String(row.materialQuantityUsed) });
        setEditErr("");
    };

    const cancelEdit = () => {
        setEditing(null);
        setEditErr("");
    };

    const handleSaveEdit = async () => {
        const qty = parseFloat(editing.qty);
        if (!qty || qty <= 0) {
            setEditErr("Enter a valid quantity.");
            return;
        }
        try {
            await api.put(`/product-materials/${editing.id}`, { materialQuantityUsed: qty });
            setEditing(null);
            load();
        } catch {
            setEditErr("Could not update quantity.");
        }
    };

    // Effective cost per unit (bulk-pack materials divide pack price by units per pack)
    const effectiveCpu = (mat) => {
        if (!mat) return 0;
        return mat.unitsPerPack > 0 ? mat.costPerUnit / mat.unitsPerPack : (mat.costPerUnit ?? 0);
    };

    const totalCost = rows.reduce((sum, r) => {
        const cpu = effectiveCpu(r.materialId);
        return sum + cpu * (r.materialQuantityUsed ?? 0);
    }, 0);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Materials — {product?.name ?? ""}</DialogTitle>
            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Add row */}
                <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <Autocomplete
                        size="small"
                        sx={{ flex: "1 1 240px", minWidth: 200 }}
                        options={allMats}
                        getOptionLabel={(opt) => `${opt.name}${opt.color ? ` — ${opt.color}` : ""} (${opt.type ?? ""})`}
                        isOptionEqualToValue={(opt, val) => opt._id === val._id}
                        value={newMat}
                        onChange={(_, val) => setNewMat(val)}
                        renderInput={(params) => <TextField {...params} label="Material" />}
                    />
                    <TextField size="small" sx={{ width: 130 }} label={`Qty (${newMat?.unit ?? "units"})`} type="number" value={newQty} onChange={(e) => setNewQty(e.target.value)} inputProps={{ min: 0, step: "any" }} />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} disabled={adding} sx={{ height: 40, alignSelf: "center" }}>
                        Add
                    </Button>
                </Box>
                {addError && (
                    <Alert severity="warning" sx={{ mb: 2, py: 0 }}>
                        {addError}
                    </Alert>
                )}

                {/* Table */}
                <Paper variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "primary.main", "& .MuiTableCell-head": { color: "white", fontWeight: 700 } }}>
                                <TableCell>Id</TableCell>
                                <TableCell>ProductId</TableCell>
                                <TableCell>MaterialId</TableCell>
                                <TableCell>Material Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell align="right">MaterialQuantityUsed</TableCell>
                                <TableCell align="right">Cost/Unit</TableCell>
                                <TableCell align="right">Line Cost</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        <Typography variant="body2" color="text.secondary" py={2}>
                                            Loading…
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        <Typography variant="body2" color="text.secondary" py={2}>
                                            No materials linked. Add one above.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => {
                                    const mat = row.materialId;
                                    const cpu = effectiveCpu(mat);
                                    const qty = row.materialQuantityUsed ?? 0;
                                    const line = cpu * qty;
                                    const isEditingRow = editing?.id === row._id;

                                    return (
                                        <TableRow key={row._id} hover>
                                            <TableCell sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.disabled" }}>{row._id}</TableCell>
                                            <TableCell sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.disabled" }}>{product?._id}</TableCell>
                                            <TableCell sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.disabled" }}>{mat?._id}</TableCell>
                                            <TableCell>{mat?.name ?? "—"}</TableCell>
                                            <TableCell>{mat?.materialType ? <Chip label={String(mat.materialType)} size="small" variant="outlined" /> : "—"}</TableCell>
                                            <TableCell align="right" sx={{ width: 160 }}>
                                                {isEditingRow ? (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}>
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={editing.qty}
                                                            onChange={(e) => setEditing((ed) => ({ ...ed, qty: e.target.value }))}
                                                            inputProps={{ min: 0, step: "any", style: { textAlign: "right", width: 80 } }}
                                                            error={!!editErr}
                                                            helperText={editErr}
                                                            sx={{ width: 100 }}
                                                        />
                                                        <Tooltip title="Save">
                                                            <IconButton size="small" color="primary" onClick={handleSaveEdit}>
                                                                <CheckIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Cancel">
                                                            <IconButton size="small" onClick={cancelEdit}>
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                ) : (
                                                    qty
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                {sym}
                                                {cpu.toFixed(4)}
                                            </TableCell>
                                            <TableCell align="right">
                                                {sym}
                                                {line.toFixed(2)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                                {!isEditingRow && (
                                                    <>
                                                        <Tooltip title="Edit quantity">
                                                            <IconButton size="small" onClick={() => startEdit(row)}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Remove">
                                                            <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}>
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </Paper>

                {/* Total */}
                {rows.length > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" mr={1}>
                            Total material cost:
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                            {sym}
                            {totalCost.toFixed(2)}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
