import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, doc, getDocs, query, setDoc, updateDoc } from 'firebase/firestore';
import { TextField, Button, Typography, Grid, Chip, Box, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import '../styles/ProductParametersForm.css';

const initialFields = [
  { name: 'materials', label: 'Materials' },
  { name: 'lamination', label: 'Lamination' },
  { name: 'orientation', label: 'Orientation' },
  { name: 'printing_location', label: 'Printing Location' },
  { name: 'size', label: 'Size' },
  { name: 'fold_type', label: 'Fold Type' },
  { name: 'bind_type', label: 'Bind Type' },
  { name: 'cover_material', label: 'Cover Material' },
  { name: 'lamination_cover', label: 'Lamination Cover' },
  { name: 'pages', label: 'Pages' },
  { name: 'paper_type', label: 'Paper Type' },
  { name: 'inner_page_print_type', label: 'Inner Page Print Type' },
  { name: 'color', label: 'Color' },
  { name: 'quantity', label: 'Quantity' },
];

const ProductParametersForm = () => {
  const [productParameters, setProductParameters] = useState({});
  const [docId, setDocId] = useState(null);
  const [fields, setFields] = useState(initialFields);
  const [newValues, setNewValues] = useState(
    initialFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState(null);
  const [dataToEdit, setDataToEdit] = useState({ field: null, value: null });
  const [dataToDelete, setDataToDelete] = useState({ field: null, value: null });
  const [isDataDeletePopupOpen, setIsDataDeletePopupOpen] = useState(false);

  useEffect(() => {
    const fetchProductParameters = async () => {
      const q = query(collection(db, 'productParameters'));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const existingDoc = querySnapshot.docs[0];
        setDocId(existingDoc.id);
        setProductParameters(existingDoc.data());
      } else {
        const newDocRef = doc(collection(db, 'productParameters'));
        await setDoc(newDocRef, {});
        setDocId(newDocRef.id);
        setProductParameters({});
      }
    };
    fetchProductParameters();
  }, []);

  const handleInputChange = (field, value) => {
    setNewValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddOrEditParameter = async (field) => {
    const value = field === 'quantity' ? parseInt(newValues[field], 10) : newValues[field].trim();
    if (!value) return;

    let updatedParameters;
    if (dataToEdit.field === field && dataToEdit.value) {
      // Editing existing data
      updatedParameters = {
        ...productParameters,
        [field]: productParameters[field].map((item) => (item === dataToEdit.value ? value : item)),
      };
      setDataToEdit({ field: null, value: null }); // Clear the edit state
    } else {
      // Adding new data
      updatedParameters = {
        ...productParameters,
        [field]: productParameters[field] ? [...new Set([...productParameters[field], value])] : [value],
      };
    }

    try {
      const docRef = doc(db, 'productParameters', docId);
      await setDoc(docRef, updatedParameters, { merge: true });
      setProductParameters(updatedParameters);
      setNewValues((prev) => ({ ...prev, [field]: '' }));
    } catch (error) {
      console.error('Error adding or editing parameter: ', error);
    }
  };

  const handleDeleteParameter = async () => {
    const { field, value } = dataToDelete;
    const updatedList = productParameters[field].filter((item) => item !== value);
    const updatedParameters = {
      ...productParameters,
      [field]: updatedList,
    };
    try {
      const docRef = doc(db, 'productParameters', docId);
      await setDoc(docRef, updatedParameters, { merge: true });
      setProductParameters(updatedParameters);
      setIsDataDeletePopupOpen(false);
      setDataToDelete({ field: null, value: null });
    } catch (error) {
      console.error('Error deleting parameter: ', error);
    }
  };

  const openDeleteDataConfirmation = (field, value) => {
    setDataToDelete({ field, value });
    setIsDataDeletePopupOpen(true);
  };

  const openEditData = (field, value) => {
    setNewValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setDataToEdit({ field, value });
  };

  const handleAddNewField = async () => {
  if (!newFieldName.trim()) return;
  const newField = {
    name: newFieldName.toLowerCase().replace(/\s+/g, '_'),
    label: newFieldName
  };
  
  const updatedFields = [...fields, newField];
  setFields(updatedFields);
  setNewValues((prev) => ({ ...prev, [newField.name]: '' }));
  setNewFieldName('');
  setIsPopupOpen(false);

  try {
    const docRef = doc(db, 'productParameters', docId);
    await updateDoc(docRef, { fields: updatedFields });
  } catch (error) {
    console.error('Error adding new field: ', error);
  }
};

const handleDeleteField = async () => {
  if (fieldToDelete) {
    const updatedFields = fields.filter(field => field.name !== fieldToDelete);
    setFields(updatedFields);
    const updatedParameters = { ...productParameters };
    delete updatedParameters[fieldToDelete];

    try {
      const docRef = doc(db, 'productParameters', docId);
      await updateDoc(docRef, { 
        fields: updatedFields, 
        [`parameters.${fieldToDelete}`]: updateDoc.FieldValue.delete()
      });
      setProductParameters(updatedParameters);
      setIsDeletePopupOpen(false); // Ensure the popup closes after successful delete
      setFieldToDelete(null);
    } catch (error) {
      console.error('Error deleting field: ', error);
      setIsDeletePopupOpen(false); // Close the popup even if there is an error
    }
  }
};


  const openDeleteConfirmation = (fieldName) => {
    setFieldToDelete(fieldName);
    setIsDeletePopupOpen(true);
  };

  return (
    <div className="product-parameters-form">
      <Box display="flex" justifyContent="flex-end" padding="10px">
        <IconButton 
          color="primary" 
          onClick={() => setIsPopupOpen(true)}
        >
          <AddIcon />
        </IconButton>
      </Box>
      <Typography variant="h4" component="h2" gutterBottom>
        Add Product Parameters
      </Typography>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid item xs={12} sm={6} md={4} key={field.name}>
            <Card variant="outlined" className="parameter-card">
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">{field.label}</Typography>
                  <IconButton
                    color="inherit"
                    onClick={() => openDeleteConfirmation(field.name)}
                  >
                    <DeleteIcon style={{ color: 'black' }} />
                  </IconButton>
                </Box>
                <TextField
                  variant="outlined"
                  fullWidth
                  placeholder={`Add ${field.label}`}
                  value={newValues[field.name]}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddOrEditParameter(field.name)}
                  margin="normal"
                  className="parameter-input"
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => handleAddOrEditParameter(field.name)} 
                  className="add-button"
                >
                  {dataToEdit.field === field && dataToEdit.value ? 'Edit' : 'Add'}
                </Button>
                <Box className="chip-container">
                  {productParameters[field.name] && productParameters[field.name].map((value, index) => (
                    <Chip
                      key={index}
                      label={value}
                      onClick={() => openEditData(field.name, value)}
                      onDelete={() => openDeleteDataConfirmation(field.name, value)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialogs for Add Field and Delete Confirmation */}
      
      <Dialog
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: { 
            minWidth: '400px', 
            minHeight: '200px', 
            padding: '20px' 
          },
        }}
      >
        <DialogTitle>Add New Field</DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            fullWidth
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPopupOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddNewField} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDeletePopupOpen}
        onClose={() => setIsDeletePopupOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Field</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this field?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeletePopupOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteField} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDataDeletePopupOpen}
        onClose={() => setIsDataDeletePopupOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Data</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this data?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDataDeletePopupOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteParameter} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductParametersForm;
