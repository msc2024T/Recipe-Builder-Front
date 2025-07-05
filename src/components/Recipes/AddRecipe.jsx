import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import './AddRecipe.css';
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

const AddRecipe = ({ open, onClose, onRecipeAdded }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [image_id, setImageId] = useState(null);
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

    // Handle modal open/close states to prevent unwanted API calls
    useEffect(() => {
        // Dispatch custom events to prevent RecipeList from refetching unnecessarily
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
    } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
    });    // Handle image upload function
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

            // Clean up previous preview if exists
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
            formData.append('image_id', image_id || null);

            if (selectedImage) {
                formData.append('image', selectedImage);

            }

            const response = await http_service.post('/recipes/recipe/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage('Recipe created successfully!');

            // Clean up after successful submission
            reset();
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview('');
            setSelectedImage(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }



            // Call the callback to refresh the recipe list
            if (onRecipeAdded) {
                onRecipeAdded();
            }

            // Close modal after successful creation
            setTimeout(() => {
                if (isMountedRef.current) {
                    onClose();
                    setMessage('');
                }
            }, 1500);

        } catch (err) {
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                'Failed to create recipe. Please try again.';
            if (isMountedRef.current) {
                setError(errorMessage);
            }
            console.error('Recipe creation error:', err);
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

        // Clean up any object URLs to avoid memory leaks
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }

        setImagePreview('');
        setSelectedImage(null);
        setMessage('');
        setError('');

        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        // Close the dialog with a small delay to ensure our event handling is complete
        setTimeout(() => {
            onClose();

            // End modal interaction after a short delay to prevent unwanted API calls
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('modalInteractionEnd'));
            }, 100);
        }, 0);
    };



    return (
        <StyledDialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
            disableAutoFocus
            disableEnforceFocus
            disableRestoreFocus
            onClick={(e) => {
                // Prevent any bubbling that might trigger unwanted effects
                e.stopPropagation();
            }}
        >
            <StyledDialogTitle>
                <Box display="flex" alignItems="center" gap={2}>
                    <Restaurant sx={{ fontSize: 32, color: '#ff8c00' }} />
                    <Box>
                        <Typography
                            variant="h5"
                            component="h2"
                            sx={{
                                fontWeight: 700,
                                color: '#ff8c00',
                                lineHeight: 1.2,
                                mb: 0.5
                            }}
                        >
                            Add New Recipe
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Share your culinary creation with the world
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={handleClose}
                    sx={{
                        color: '#ff8c00',
                        '&:hover': { background: 'rgba(255, 140, 0, 0.1)' }
                    }}
                >
                    <Close />
                </IconButton>
            </StyledDialogTitle>

            <StyledDialogContent>
                <Box component="div" sx={{ pt: 3 }}>
                    <Stack spacing={3}>
                        {/* Recipe Title */}
                        <StyledTextField
                            fullWidth
                            label="Recipe Title"
                            placeholder="Enter a delicious recipe name..."
                            {...register('title')}
                            error={!!errors.title}
                            helperText={errors.title?.message}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Restaurant sx={{ color: '#ff8c00' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />



                        {/* Instructions */}
                        <AutoExpandingTextField
                            fullWidth
                            label="Instructions"
                            placeholder="Write detailed cooking instructions..."
                            multiline
                            minRows={2}
                            maxRows={10}
                            {...register('instructions')}
                            error={!!errors.instructions}
                            helperText={errors.instructions?.message}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                                        <Description sx={{ color: '#ff8c00' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {/* Image Upload */}
                        <Box>
                            <Typography variant="body2" sx={{ mb: 2, color: '#666', fontWeight: 500 }}>
                                Recipe Image
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* Manual button approach with clear separation of concerns */}


                                {/* Image preview */}
                                {imagePreview ? (
                                    <Box sx={{ position: 'relative', mt: 2 }}>
                                        <Box
                                            component="img"
                                            src={imagePreview}
                                            alt="Recipe preview"
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
                                            backgroundColor: 'rgba(255, 140, 0, 0.05)',
                                            '&:hover': {
                                                borderColor: '#ff8c00',
                                                backgroundColor: 'rgba(255, 140, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <Stack spacing={1} alignItems="center" sx={{ p: 1 }}>
                                            <CloudUpload sx={{ fontSize: 30, color: '#ff8c00' }} />
                                            <Typography variant="h6" sx={{ color: '#ff8c00', fontWeight: 600 }}>
                                                Upload Recipe Image
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
                                                    // Prevent any default behavior or propagation
                                                    e.preventDefault();
                                                    e.stopPropagation();

                                                    // Notify that we're interacting with modal elements
                                                    window.dispatchEvent(new CustomEvent('modalInteractionStart'));



                                                    // Trigger file input click using ref
                                                    if (fileInputRef.current) {
                                                        // Use setTimeout to prevent any race conditions
                                                        setTimeout(() => {
                                                            fileInputRef.current.click();
                                                        }, 0);
                                                    }

                                                    return false;
                                                }}
                                                startIcon={<CloudUpload />}
                                            >
                                                Select Image File
                                            </Button>

                                            {/* Hidden file input using ref */}
                                            <input
                                                id="recipe-image-upload"
                                                ref={fileInputRef}
                                                type="file"
                                                style={{ display: 'none' }}
                                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                }}
                                                onChange={(e) => {
                                                    // Ensure this doesn't bubble up
                                                    e.stopPropagation();
                                                    e.preventDefault();

                                                    handleImageUpload(e);

                                                    // After handling the upload, end the modal interaction period
                                                    setTimeout(() => {
                                                        window.dispatchEvent(new CustomEvent('modalInteractionEnd'));
                                                    }, 100);
                                                }}
                                            />
                                        </Stack>
                                    </Box>

                                )}
                            </Box>
                            {errors.image && (
                                <Typography variant="caption" sx={{ color: '#d32f2f', mt: 1, display: 'block' }}>
                                    {errors.image.message}
                                </Typography>
                            )}
                        </Box>

                        {/* Messages */}
                        {error && (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {message && (
                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                                {message}
                            </Alert>
                        )}
                    </Stack>
                </Box>
            </StyledDialogContent>

            <DialogActions sx={{ padding: 3, gap: 2 }}>
                <ActionButton
                    className="secondary"
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={onClose}
                    disabled={loading}
                >
                    Close
                </ActionButton>
                <Button
                    type="button" // Explicitly set type to button to prevent form submission
                    className="primary"
                    onClick={(e) => {
                        // Prevent any default behaviors
                        e.stopPropagation();
                        e.preventDefault();



                        if (loading) {

                            return;
                        }

                        // Get form values manually
                        const title = watch('title');
                        const instructions = watch('instructions');



                        // Manual validation
                        if (!title || title.length < 3) {
                            setError('Recipe title is required and must be at least 3 characters');
                            return;
                        }

                        if (!instructions || instructions.length < 10) {
                            setError('Instructions are required and must be at least 10 characters');
                            return;
                        }

                        // Form is valid, call submit manually

                        onSubmit({
                            title,
                            instructions,
                            image: selectedImage
                        });
                    }}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    sx={{
                        padding: '12px 24px',
                        borderRadius: 12,
                        fontSize: '1rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(183, 104, 36, 0.4)',
                        background: 'linear-gradient(135deg, #ff8c00 0%, #b76824 100%)',
                        color: 'white',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #d67200 0%, #a05a1e 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(183, 104, 36, 0.5)',
                        },
                    }}
                >
                    {loading ? 'Creating Recipe...' : 'Save Recipe'}
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default AddRecipe;
