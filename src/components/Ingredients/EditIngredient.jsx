import React, { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Box,
    Typography,
    Stack,
    IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload, Clear } from '@mui/icons-material';
import http_service from '../../utils/http_service';
import { uploadImage } from '../../utils/upload_image';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 24,
        maxWidth: 700,
        width: '100%',
        margin: theme.spacing(2),
        maxHeight: '90vh',
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.1) 0%, rgba(255, 140, 0, 0.05) 100%)',
    borderBottom: '2px solid rgba(255, 140, 0, 0.2)',
    padding: theme.spacing(2, 3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: theme.spacing(3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 12,
        '&:hover fieldset': {
            borderColor: '#ff8c00',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#ff8c00',
        },
    },
    '& .MuiInputLabel-root': {
        '&.Mui-focused': {
            color: '#ff8c00',
        },
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
    padding: '12px 24px',
    borderRadius: 12,
    fontSize: '1rem',
    fontWeight: 700,
    textTransform: 'none',
    boxShadow: '0 4px 12px rgba(183, 104, 36, 0.4)',
    '&.primary': {
        background: 'linear-gradient(135deg, #ff8c00 0%, #b76824 100%)',
        color: 'white',
        '&:hover': {
            background: 'linear-gradient(135deg, #d67200 0%, #a05a1e 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(183, 104, 36, 0.5)',
        },
    },
    '&.secondary': {
        background: 'white',
        color: '#ff8c00',
        border: '2px solid #ff8c00',
        boxShadow: '0 4px 12px rgba(183, 104, 36, 0.2)',
        '&:hover': {
            background: 'rgba(255, 140, 0, 0.1)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(183, 104, 36, 0.3)',
        },
    },
    '&:disabled': {
        background: '#ccc',
        transform: 'none',
        boxShadow: 'none',
    },
}));

const EditIngredient = ({ open, onClose, ingredient, onIngredientUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [ingredientName, setIngredientName] = useState('');
    const [ingredientUnit, setIngredientUnit] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageId, setImageId] = useState(null);

    const fileInputRef = useRef(null);

    // Initialize form with existing ingredient data
    useEffect(() => {
        if (ingredient && open) {
            setIngredientName(ingredient.name || '');
            setIngredientUnit(ingredient.unit || '');
            setImagePreview(ingredient.image_url || '');
            setImageId(ingredient.image || null);
            setError('');
            setMessage('');
            setSelectedImage(null);


        }
    }, [ingredient, open]);

    // Cleanup image preview on unmount
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageUpload = async (event) => {
        event.preventDefault();
        const file = event.target?.files?.[0];

        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Please select a valid image file (JPG, PNG, GIF, WebP)');
            return;
        }

        // Clean up previous blob URL if it exists
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        try {
            const response = await uploadImage(file);
            if (response && response.id) {
                setImageId(response.id);
            }

            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
            setSelectedImage(file);
            setError('');
        } catch (err) {
            console.error('Error in image upload:', err);
            setError('Failed to process image');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = () => {
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview('');
        setSelectedImage(null);
        setImageId(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!ingredient?.id) {
            setError('No ingredient selected for editing');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await http_service.put(`/recipes/ingredient/${ingredient.id}/`, {
                id: ingredient.id,
                name: ingredientName,
                unit: ingredientUnit,
                image_id: imageId,
            });

            setMessage('Ingredient updated successfully!');
            onIngredientUpdated(response.data.data);

            // Close modal after a brief delay to show success message
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (err) {
            setError('Failed to update ingredient. Please try again.');
            console.error('Error updating ingredient:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Clean up blob URLs on close
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        onClose();
    };

    return (
        <StyledDialog open={open} onClose={handleClose}>
            <StyledDialogTitle>
                <Typography variant="h5" sx={{ color: '#8b4513', fontWeight: 700 }}>
                    Edit Ingredient
                </Typography>
            </StyledDialogTitle>
            <StyledDialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {message && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}

                <StyledTextField
                    label="Ingredient Name"
                    fullWidth
                    margin="normal"
                    value={ingredientName}
                    onChange={(e) => setIngredientName(e.target.value)}
                    disabled={loading}
                />

                <StyledTextField
                    label="Unit"
                    fullWidth
                    margin="normal"
                    value={ingredientUnit}
                    onChange={(e) => setIngredientUnit(e.target.value)}
                    disabled={loading}
                />

                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: '#666', fontWeight: 500 }}>
                        Ingredient Image
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {imagePreview ? (
                            <Box sx={{ position: 'relative', mt: 2 }}>
                                <Box
                                    component="img"
                                    src={imagePreview}
                                    alt="Ingredient preview"
                                    sx={{
                                        width: '100%',
                                        height: 'auto',
                                        maxHeight: '300px',
                                        objectFit: 'contain',
                                        borderRadius: 2,
                                        border: '1px solid #ddd',
                                    }}
                                    onError={(e) => {
                                        console.error('Image preview error:', e);
                                        setImagePreview('');
                                        setError('Failed to display image preview');
                                    }}
                                />
                                <IconButton
                                    onClick={handleRemoveImage}
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        color: '#d32f2f',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 1)',
                                        },
                                    }}
                                    size="small"
                                    disabled={loading}
                                >
                                    <Clear />
                                </IconButton>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    border: '2px dashed rgba(255, 140, 0, 0.3)',
                                    borderRadius: 2,
                                    padding: 2,
                                    marginBottom: 2,
                                    backgroundColor: 'rgba(255, 140, 0, 0.05)',
                                    '&:hover': {
                                        borderColor: '#ff8c00',
                                        backgroundColor: 'rgba(255, 140, 0, 0.1)',
                                    },
                                }}
                            >
                                <Stack spacing={1} alignItems="center" sx={{ p: 1, marginBottom: 2 }}>
                                    <CloudUpload sx={{ fontSize: 30, color: '#ff8c00' }} />
                                    <Typography variant="h6" sx={{ color: '#ff8c00', fontWeight: 600 }}>
                                        Upload New Image
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                                        (JPG, PNG, GIF, WebP - Max 5MB)
                                    </Typography>
                                    <Button
                                        type="button"
                                        variant="contained"
                                        color="primary"
                                        sx={{ mt: 2 }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (fileInputRef.current) {
                                                setTimeout(() => {
                                                    fileInputRef.current.click();
                                                }, 0);
                                            }
                                            return false;
                                        }}
                                        startIcon={<CloudUpload />}
                                        disabled={loading}
                                    >
                                        Select Image File
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        style={{ display: 'none' }}
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        onChange={handleImageUpload}
                                    />
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <ActionButton
                        className="secondary"
                        fullWidth
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </ActionButton>
                    <ActionButton
                        className="primary"
                        fullWidth
                        onClick={handleSubmit}
                        disabled={loading || !ingredientName || !ingredientUnit}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Update Ingredient'}
                    </ActionButton>
                </Box>
            </StyledDialogContent>
        </StyledDialog>
    );
};

export default EditIngredient;
