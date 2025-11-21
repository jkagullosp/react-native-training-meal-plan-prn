import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Button,
  Image,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { Platform } from 'react-native';
import Input from '../components/Input';
import { SafeAreaView } from 'react-native-safe-area-context';
import CreateRecipeHeader from '../modules/community-recipes/components/CreateRecipeHeader';
import { useCommunityStore } from '../modules/community-recipes/store/useCommunityStore';
import { useAuthStore } from '../modules/auth/store/useAuthStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  pickImageFromDevice,
  uploadImageToSupabase,
} from '../modules/community-recipes/utils/ImageHelper';
import { useDiscoverStore } from '../modules/discover/store/useDiscoverStore';
import { ImagePlus, CircleX } from 'lucide-react-native';

export default function CreateRecipeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { createCommunityRecipe } = useCommunityStore();
  const { fetchRecipes } = useDiscoverStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const openImageModal = () => setModalVisible(true);
  const closeImageModal = () => setModalVisible(false);

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('easy');
  const [totalTime, setTotalTime] = useState<string>('');
  const [servings, setServings] = useState<string>('');
  const [calories, setCalories] = useState<string>('');
  const [fats, setFats] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [ingredients, setIngredients] = useState([
    { name: '', quantity_value: '', unit: '' },
  ]);
  const [steps, setSteps] = useState([{ instruction: '' }]);
  const [images, setImages] = useState<
    {
      local_uri?: string;
      image_url?: string;
      is_primary?: boolean;
      position?: number;
    }[]
  >([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: '', quantity_value: '', unit: '' },
    ]);
  };

  const handleIngredientChange = (
    idx: number,
    field: 'name' | 'quantity_value' | 'unit',
    value: string,
  ) => {
    setIngredients(
      ingredients.map((ing, i) =>
        i === idx ? { ...ing, [field]: value } : ing,
      ),
    );
  };

  const handleRemoveIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleAddStep = () => {
    setSteps([...steps, { instruction: '' }]);
  };

  const handleStepChange = (idx: number, value: string) => {
    setSteps(
      steps.map((step, i) => (i === idx ? { instruction: value } : step)),
    );
  };

  const handleRemoveStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput) return;
    setImages(prev => [
      ...prev,
      { image_url: imageUrlInput, is_primary: false },
    ]);
    setImageUrlInput('');
    closeImageModal();
  };

  const handleAddImageFromDevice = async (fromCamera: boolean) => {
    if (images.length >= 5) {
      Alert.alert('Limit reached', 'You can only upload up to 5 images.');
      return;
    }

    const asset = await pickImageFromDevice(fromCamera);
    closeImageModal();

    if (asset && asset.base64 && asset.uri && user?.id) {
      setImages(prev => [...prev, { local_uri: asset.uri, is_primary: false }]);

      const url = await uploadImageToSupabase(user.id, {
        base64: asset.base64,
      });

      if (url) {
        setImages(prev =>
          prev.map((img, idx) =>
            idx === prev.length - 1 && img.local_uri === asset.uri
              ? { ...img, image_url: url }
              : img,
          ),
        );
      }
    }
  };

  const setPrimaryImage = (idx: number) => {
    setImages(prev =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === idx,
      })),
    );
  };

  const validateFields = () => {
    if (!title.trim()) return 'Recipe title is required.';
    if (!description.trim()) return 'Recipe description is required.';
    if (!difficulty.trim()) return 'Difficulty is required.';
    if (!totalTime.trim() || isNaN(Number(totalTime)))
      return 'Total time is required and must be a number.';
    if (!servings.trim() || isNaN(Number(servings)))
      return 'Servings is required and must be a number.';
    if (!calories.trim() || isNaN(Number(calories)))
      return 'Calories is required and must be a number.';
    if (!fats.trim() || isNaN(Number(fats)))
      return 'Fats is required and must be a number.';
    if (!protein.trim() || isNaN(Number(protein)))
      return 'Protein is required and must be a number.';
    if (!carbs.trim() || isNaN(Number(carbs)))
      return 'Carbs is required and must be a number.';
    if (
      ingredients.length === 0 ||
      ingredients.some(i => !i.name.trim() || !i.quantity_value.trim())
    )
      return 'All ingredients must have a name and quantity.';
    if (steps.length === 0 || steps.some(s => !s.instruction.trim()))
      return 'All steps must have instructions.';
    if (
      images.length === 0 ||
      !images.some(img => img.image_url || img.local_uri)
    )
      return 'At least one image is required.';
    if (tags.length === 0) return 'At least one tag is required.';
    return null;
  };

  const handleCreate = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a recipe.');
      return;
    }

    const validationError = validateFields();
    if (validationError) {
      Alert.alert('Missing Fields', validationError);
      return;
    }

    try {
      await createCommunityRecipe(user.id, {
        title,
        description,
        ingredients: ingredients
          .filter(i => i.name)
          .map(i => ({
            name: i.name,
            quantity_value: Number(i.quantity_value) || 1,
            unit: i.unit || '',
          })),
        steps: steps
          .filter(s => s.instruction)
          .map((s, idx) => ({ ...s, step_number: idx + 1 })),
        tags: tags.filter(t => t),
        images: images.map((img, idx) => ({
          image_url: img.image_url ?? img.local_uri ?? '',
          is_primary: img.is_primary,
          position: idx + 1,
        })),
        difficulty,
        total_time: Number(totalTime) || null || undefined,
        servings: Number(servings) || null || undefined,
        calories: Number(calories) || null || undefined,
        fat: Number(fats) || null || undefined,
        protein: Number(protein) || null || undefined,
        carbs: Number(carbs) || null || undefined,
      });
      Alert.alert('Success', 'Recipe created!');
      await fetchRecipes();
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create recipe');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.keyboardAvoidingViewStyle}>
        <ScrollView contentContainerStyle={styles.container}>
          <CreateRecipeHeader navigation={navigation} />
          <View style={{ marginTop: 16 }}>
            {images.length === 0 && (
              <View style={styles.noImage}>
                {Platform.OS === 'ios' ? (
                  <Icon name="image" size={45} color={'#cdcacaff'} />
                ) : (
                  <ImagePlus size={45} color={'#cdcacaff'} />
                )}
              </View>
            )}
          </View>
          <ScrollView horizontal contentContainerStyle={{ gap: 12 }}>
            {images.map((img, idx) => (
              <TouchableOpacity key={idx} onPress={() => setPrimaryImage(idx)}>
                <Image
                  source={{ uri: img.local_uri || img.image_url }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    borderWidth: img.is_primary ? 2 : 0,
                    borderColor: img.is_primary ? '#E16235' : 'transparent',
                  }}
                  resizeMode="cover"
                />
                {img.is_primary && (
                  <Text
                    style={{
                      color: '#E16235',
                      fontSize: 12,
                      textAlign: 'center',
                    }}
                  >
                    Primary
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            onPress={openImageModal}
            style={styles.buttonContainer}
          >
            <Text style={styles.addImageButton}>Add Image</Text>
          </TouchableOpacity>
          <View style={styles.inputsContainer}>
            <Input
              placeholder="e.g. Kyle's Dinuguan"
              value={title}
              onChangeText={setTitle}
              label="Recipe Title"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              placeholder="A delicious Filipino stew made with pork and pig's blood."
              value={description}
              onChangeText={setDescription}
              label="Recipe Description"
              multiline={true}
            />
            <View style={styles.inputRow}>
              <View style={{ flexDirection: 'column', gap: 3, flex: 1 }}>
                <Text style={{ fontSize: 12 }}>Cooking time</Text>
                <TextInput
                  placeholder="in minutes"
                  value={totalTime}
                  onChangeText={setTotalTime}
                  style={[styles.input, { padding: 12, fontSize: 12 }]}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flexDirection: 'column', gap: 3, flex: 1 }}>
                <Text style={{ fontSize: 12 }}>Difficulty</Text>
                <TextInput
                  placeholder="easy, medium, or hard"
                  value={difficulty}
                  onChangeText={setDifficulty}
                  style={[styles.input, { padding: 12, fontSize: 12 }]}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={{ flexDirection: 'column', gap: 3, flex: 1 }}>
                <Text style={{ fontSize: 12 }}>Servings</Text>
                <TextInput
                  placeholder="e.g. 4"
                  value={servings}
                  onChangeText={setServings}
                  style={[styles.input, { padding: 12, fontSize: 12 }]}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={{ flexDirection: 'column', gap: 3, flex: 1 }}>
                <Text style={{ fontSize: 12 }}>Calories</Text>
                <TextInput
                  placeholder="Kcal"
                  value={calories}
                  onChangeText={setCalories}
                  style={[styles.input, { padding: 12, fontSize: 12 }]}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flexDirection: 'column', gap: 3, flex: 1 }}>
                <Text style={{ fontSize: 12 }}>Fats</Text>
                <TextInput
                  placeholder="g"
                  value={fats}
                  onChangeText={setFats}
                  style={[styles.input, { padding: 12, fontSize: 12 }]}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flexDirection: 'column', gap: 3, flex: 1 }}>
                <Text style={{ fontSize: 12 }}>Protein</Text>
                <TextInput
                  placeholder="g"
                  value={protein}
                  onChangeText={setProtein}
                  style={[styles.input, { padding: 12, fontSize: 12 }]}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flexDirection: 'column', gap: 3, flex: 1 }}>
                <Text style={{ fontSize: 12 }}>Carbs</Text>
                <TextInput
                  placeholder="g"
                  value={carbs}
                  onChangeText={setCarbs}
                  style={[styles.input, { padding: 12, fontSize: 12 }]}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Ingredients Section */}
          <View style={{ flexDirection: 'column', gap: 8 }}>
            <Text style={{ fontSize: 12 }}>Ingredients</Text>
            {ingredients.map((ingredient, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <TextInput
                  placeholder="Name"
                  value={ingredient.name}
                  onChangeText={text =>
                    handleIngredientChange(idx, 'name', text)
                  }
                  style={[styles.input, { flex: 2, marginRight: 8 }]}
                />
                <TextInput
                  placeholder="Qty"
                  value={ingredient.quantity_value}
                  onChangeText={text =>
                    handleIngredientChange(
                      idx,
                      'quantity_value',
                      text.replace(/[^0-9.]/g, ''),
                    )
                  }
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChangeText={text =>
                    handleIngredientChange(idx, 'unit', text)
                  }
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                />
                <TouchableOpacity onPress={() => handleRemoveIngredient(idx)}>
                  {Platform.OS === 'ios' ? (
                    <Icon name="close" size={22} color="#E16235" />
                  ) : (
                    <CircleX size={22} color="#E16235" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={handleAddIngredient}
              style={styles.buttonContainer}
            >
              <Text style={styles.addImageButton}>Add Ingredient</Text>
            </TouchableOpacity>
          </View>

          {/* Steps Section */}
          <View style={{ flexDirection: 'column', gap: 8 }}>
            <Text style={{ fontSize: 12 }}>Steps</Text>
            {steps.map((step, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ marginRight: 8 }}>{idx + 1}.</Text>
                <TextInput
                  placeholder={`Step ${idx + 1} instruction`}
                  value={step.instruction}
                  onChangeText={text => handleStepChange(idx, text)}
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                />
                <TouchableOpacity onPress={() => handleRemoveStep(idx)}>
                  {Platform.OS === 'ios' ? (
                    <Icon name="close" size={22} color="#E16235" />
                  ) : (
                    <CircleX size={22} color="#E16235" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => handleAddStep()}
              style={styles.buttonContainer}
            >
              <Text style={styles.addImageButton}>Add Step</Text>
            </TouchableOpacity>
          </View>

          {/* Tags Section */}
          <View style={{ flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 12 }}>Tags</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <TextInput
                placeholder="Add a tag (e.g. pork, stew)"
                value={tagInput}
                onChangeText={setTagInput}
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => {
                  const trimmed = tagInput.trim();
                  if (trimmed && !tags.includes(trimmed)) {
                    setTags([...tags, trimmed]);
                  }
                  setTagInput('');
                }}
                style={{
                  backgroundColor: '#E16235',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {tags.map((tag, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#eee',
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 13 }}>{tag}</Text>
                  <TouchableOpacity
                    onPress={() => setTags(tags.filter((_, i) => i !== idx))}
                    style={{ marginLeft: 6 }}
                  >
                    {Platform.OS === 'ios' ? (
                      <Icon name="close" size={22} color="#E16235" />
                    ) : (
                      <CircleX size={18} color="#E16235" />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
            onRequestClose={closeImageModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
                  Add Image
                </Text>
                <TextInput
                  placeholder="Paste image URL"
                  value={imageUrlInput}
                  onChangeText={setImageUrlInput}
                  style={styles.input}
                />
                <Button title="Add Image (URL)" onPress={handleAddImageUrl} />
                <View style={{ height: 8 }} />
                <Button
                  title="Add Using Image Library"
                  onPress={() => handleAddImageFromDevice(false)}
                />
                <View style={{ height: 8 }} />
                <Button
                  title="Add Using Camera"
                  onPress={() => handleAddImageFromDevice(true)}
                />
                <View style={{ height: 8 }} />
                <Button title="Cancel" onPress={closeImageModal} color="#888" />
              </View>
            </View>
          </Modal>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleCreate}
          >
            <Text style={styles.addImageButton}>Publish Recipe</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingViewStyle: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  container: {
    flexDirection: 'column',
    gap: 12,
    backgroundColor: '#F7F7F7',
    padding: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'stretch',
  },
  noImage: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    paddingVertical: 8,
    paddingHorizontal: 26,
    borderRadius: 8,
    backgroundColor: '#E16235',
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    height: 44,
    width: '100%',
    color: '#333',
    fontSize: 13,
    marginTop: Platform.OS === 'ios' ? -4 : 0,
  },
});
