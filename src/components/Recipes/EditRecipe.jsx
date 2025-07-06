import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    Alert,
    CircularProgress,
    IconButton,
    Card,
    CardMedia,
    InputAdornment,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Close,
    Restaurant,
    CloudUpload,
    Description,
    Save,
    Clear
} from '@mui/icons-material';
import http_service from '../../utils/http_service';
import { uploadImage } from '../../utils/upload_image';

// Styled components
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

const AutoExpandingTextField = styled(TextField)(({ theme }) => ({
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
    '& .MuiInputBase-input': {
        resize: 'vertical',
        minHeight: '120px',
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

// Validation schema
const schema = yup.object().shape({
    title: yup
        .string()
        .min(3, 'Recipe title must be at least 3 characters')
        .max(100, 'Recipe title must not exceed 100 characters')
        .required('Recipe title is required'),
    instructions: yup
        .string()
        .min(10, 'Instructions must be at least 10 characters')
        .required('Instructions are required'),
    image_id: yup
        .string()
        .nullable()
        .notRequired(),
});

const EditRecipe = ({ open, onClose, recipe, onRecipeUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [image_id, setImageId] = useState(null);
    const [initializing, setInitializing] = useState(false);
    // Create a ref for the file input
    const fileInputRef = useRef(null);
    // Create a ref for tracking if component is mounted
    const isMountedRef = useRef(true);
    // Track if modal is open to prevent unnecessary API calls
    const wasOpenRef = useRef(false);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            // Clean up object URL to avoid memory leaks
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // Initialize form with recipe data when modal opens
    useEffect(() => {
        if (open && recipe) {
            setInitializing(true);

            // Set form values
            setValue('title', recipe.title || '');
            setValue('instructions', recipe.instructions || '');

            // Set image data
            if (recipe.image_url) {
                setImagePreview(recipe.image_url);
                setImageId(recipe.image || null);
            }

            setInitializing(false);
        }
    }, [open, recipe]);

    // Handle modal open/close states to prevent unwanted API calls
    useEffect(() => {
        if (open && !wasOpenRef.current) {
            // Modal is opening
            wasOpenRef.current = true;
            window.dispatchEvent(new CustomEvent('modalInteractionStart'));
        } else if (!open && wasOpenRef.current) {
            // Modal is closing
            wasOpenRef.current = false;
            window.dispatchEvent(new CustomEvent('modalInteractionEnd'));
        }
    }, [open]);

    const {
        register,
        formState: { errors },
        reset,
        watch,
        setValue,
        trigger,
        handleSubmit,
    } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
    });

    // Handle image upload function
    const handleImageUpload = async (event) => {
        // Stop any propagation or default behaviors to prevent unwanted API calls
        if (event) {
            event.preventDefault();
            event.stopPropagation();

            // Signal that we're in a modal interaction to prevent RecipeList API calls
            window.dispatchEvent(new CustomEvent('modalInteractionStart'));
        }

        try {
            const file = event.target?.files?.[0];

            if (!file) {
                return;
            }

            // Basic validation
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB');
                return;
            }

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setError('Please select a valid image file (JPG, PNG, GIF, WebP)');
                return;
            }

            // Clean up previous preview if exists and it's a blob URL
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }

            const response = await uploadImage(file);

            if (response && response.id) {
                setImageId(response.id);
            }

            // Set preview using URL.createObjectURL for better performance
            const objectUrl = URL.createObjectURL(file);

            // Set image preview and file, avoid form submission triggering
            setImagePreview(objectUrl);
            setSelectedImage(file);
            setValue('image', file, { shouldValidate: false });

            // Clear any previous error
            setError('');

        } catch (err) {
            console.error('Error in image upload:', err);
            setError('Failed to process image');
        } finally {
            // Reset file input value to ensure onChange triggers even if same file is selected
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Signal end of modal interaction after a short delay
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('modalInteractionEnd'));
            }, 100);
        }
    };

    const handleRemoveImage = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // If we have an object URL, revoke it to avoid memory leaks
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        setImagePreview('');
        setSelectedImage(null);
        setImageId(null);
        setValue('image', null, { shouldValidate: false });

        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('instructions', data.instructions);

            // Only append image_id if we have one (either existing or new)
            if (image_id) {
                formData.append('image_id', image_id);
            }

            // Only append new image if user selected one
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const response = await http_service.put(`/recipes/recipe/${recipe.id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage('Recipe updated successfully!');

            // Call the callback to refresh the recipe data
            if (onRecipeUpdated) {
                onRecipeUpdated(response.data.data);
            }

            // Close modal after successful update
            setTimeout(() => {
                if (isMountedRef.current) {
                    onClose();
                    setMessage('');
                }
            }, 500);

        } catch (err) {
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                'Failed to update recipe. Please try again.';
            if (isMountedRef.current) {
                setError(errorMessage);
            }
            console.error('Recipe update error:', err);
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    const handleClose = (e) => {
        // Prevent any default behavior and stop propagation
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Signal that we're in a modal interaction
        window.dispatchEvent(new CustomEvent('modalInteractionStart'));

        // Clean up form state
        reset();

        // Clean up any object URLs to avoid memory leaks (only blob URLs)
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        setImagePreview('');
        setSelectedImage(null);
        setImageId(null);
        setMessage('');
        setError('');

        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        // Close the dialog with a small delay to ensure our event handling is complete
        setTimeout(() => {
            onClose();
            window.dispatchEvent(new CustomEvent('modalInteractionEnd'));
        }, 50);
    };

    if (!recipe) {
        return null;
    }

    return (
        <StyledDialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                },
            }}
        >
            <StyledDialogTitle>
                <Box display="flex" alignItems="center" gap={2}>
                    <Restaurant sx={{ color: '#ff8c00', fontSize: 28 }} />
                    <Typography variant="h5" sx={{ color: '#ff8c00', fontWeight: 700 }}>
                        Edit Recipe
                    </Typography>
                </Box>
                <IconButton
                    onClick={handleClose}
                    sx={{
                        color: '#ff8c00',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 140, 0, 0.1)',
                        },
                    }}
                >
                    <Close />
                </IconButton>
            </StyledDialogTitle>

            <StyledDialogContent>
                {initializing ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                        <CircularProgress sx={{ color: '#ff8c00' }} />
                    </Box>
                ) : (
                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={3}>
                            {/* Alert Messages */}
                            {message && (
                                <Alert
                                    severity="success"
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiAlert-icon': {
                                            color: '#ff8c00',
                                        },
                                    }}
                                >
                                    {message}
                                </Alert>
                            )}

                            {error && (
                                <Alert severity="error" sx={{ borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            {/* Recipe Title */}
                            <StyledTextField
                                {...register('title')}
                                label="Recipe Title"
                                placeholder="Enter a descriptive recipe title..."
                                fullWidth
                                error={!!errors.title}
                                helperText={errors.title?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Restaurant sx={{ color: '#ff8c00' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiFormHelperText-root': {
                                        marginLeft: 0,
                                    },
                                }}
                            />

                            {/* Instructions */}
                            <AutoExpandingTextField
                                {...register('instructions')}
                                label="Cooking Instructions"
                                placeholder="Provide detailed step-by-step cooking instructions..."
                                fullWidth
                                multiline
                                rows={6}
                                error={!!errors.instructions}
                                helperText={errors.instructions?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                                            <Description sx={{ color: '#ff8c00' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiFormHelperText-root': {
                                        marginLeft: 0,
                                    },
                                }}
                            />

                            <Divider sx={{ my: 2 }} />

                            {/* Image Upload Section */}
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#ff8c00',
                                        fontWeight: 600,
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <CloudUpload />
                                    Recipe Image
                                </Typography>

                                {/* Image Preview */}
                                {imagePreview && (
                                    <Card
                                        sx={{
                                            mb: 2,
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            position: 'relative',
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={imagePreview}
                                            alt="Recipe preview"
                                            sx={{ objectFit: 'cover' }}
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
                                        >
                                            <Clear />
                                        </IconButton>
                                    </Card>
                                )}

                                {/* Upload Button */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                />
                                <Button
                                    variant="outlined"
                                    startIcon={<CloudUpload />}
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{
                                        borderColor: '#ff8c00',
                                        color: '#ff8c00',
                                        borderRadius: 2,
                                        padding: '12px 24px',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        '&:hover': {
                                            borderColor: '#d67200',
                                            backgroundColor: 'rgba(255, 140, 0, 0.1)',
                                        },
                                    }}
                                    fullWidth
                                >
                                    {imagePreview ? 'Change Image' : 'Upload Image'}
                                </Button>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#666',
                                        mt: 1,
                                        fontSize: '0.875rem',
                                        textAlign: 'center',
                                    }}
                                >
                                    JPG, PNG, GIF, WebP • Max 5MB
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                )}
            </StyledDialogContent>

            <DialogActions sx={{ padding: '16px 24px' }}>
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                    <ActionButton
                        className="secondary"
                        onClick={handleClose}
                        disabled={loading}
                        sx={{ flex: 1 }}
                    >
                        Cancel
                    </ActionButton>
                    <ActionButton
                        className="primary"
                        onClick={handleSubmit(onSubmit)}
                        disabled={loading || initializing}
                        startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Save />}
                        sx={{ flex: 1 }}
                    >
                        {loading ? 'Updating...' : 'Update Recipe'}
                    </ActionButton>
                </Stack>
            </DialogActions>
        </StyledDialog>
    );
};

export default EditRecipe;
