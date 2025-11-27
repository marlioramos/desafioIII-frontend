import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ListRenderItem
} from 'react-native';

// ALTERE ESTE IP PARA O SEU IP LOCAL
const API_URL = 'http://colocarIP:3000';

interface Movie {
  id: number;
  title: string;
  director: string;
  year: number;
  rating: number;
}

interface MovieForm {
  title: string;
  director: string;
  year: string;
  rating: string;
}

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [form, setForm] = useState<MovieForm>({
    title: '',
    director: '',
    year: '',
    rating: ''
  });

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/movies`);
      const data: Movie[] = await response.json();
      setMovies(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os filmes');
    }
  };

  const openModal = (movie: Movie | null = null): void => {
    if (movie) {
      setEditingMovie(movie);
      setForm({
        title: movie.title,
        director: movie.director,
        year: String(movie.year),
        rating: String(movie.rating)
      });
    } else {
      setEditingMovie(null);
      setForm({ title: '', director: '', year: '', rating: '' });
    }
    setModalVisible(true);
  };

  const closeModal = (): void => {
    setModalVisible(false);
    setEditingMovie(null);
    setForm({ title: '', director: '', year: '', rating: '' });
  };

  const saveMovie = async (): Promise<void> => {
    if (!form.title || !form.director || !form.year) {
      Alert.alert('Atenção', 'Preencha título, diretor e ano');
      return;
    }

    try {
      const url = editingMovie
        ? `${API_URL}/movies/${editingMovie.id}`
        : `${API_URL}/movies`;
      
      const method = editingMovie ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          director: form.director,
          year: parseInt(form.year),
          rating: parseInt(form.rating) || 0
        })
      });

      if (response.ok) {
        loadMovies();
        closeModal();
        Alert.alert('Sucesso', editingMovie ? 'Filme atualizado!' : 'Filme adicionado!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o filme');
    }
  };

  const deleteMovie = (movie: Movie): void => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente excluir "${movie.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/movies/${movie.id}`, {
                method: 'DELETE'
              });
              if (response.ok) {
                loadMovies();
                Alert.alert('Sucesso', 'Filme excluído!');
              }
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o filme');
            }
          }
        }
      ]
    );
  };

  const renderStars = (rating: number): string => {
    return '⭐'.repeat(rating);
  };

  const renderMovie: ListRenderItem<Movie> = ({ item }) => (
    <View style={styles.movieCard}>
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{item.title}</Text>
        <Text style={styles.movieDirector}>Dir: {item.director}</Text>
        <View style={styles.movieDetails}>
          <Text style={styles.movieYear}>{item.year}</Text>
          <Text style={styles.movieRating}>{renderStars(item.rating)}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => openModal(item)}
        >
          <Text style={styles.btnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteMovie(item)}
        >
          <Text style={styles.btnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎬 Meus Filmes</Text>
      </View>

      <FlatList
        data={movies}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={renderMovie}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => openModal()}
      >
        <Text style={styles.addButtonText}>+ Adicionar Filme</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingMovie ? 'Editar Filme' : 'Novo Filme'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Título do filme"
              placeholderTextColor="#666"
              value={form.title}
              onChangeText={(text) => setForm({ ...form, title: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Diretor"
              placeholderTextColor="#666"
              value={form.director}
              onChangeText={(text) => setForm({ ...form, director: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Ano"
              placeholderTextColor="#666"
              value={form.year}
              onChangeText={(text) => setForm({ ...form, year: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Nota (0-5)"
              placeholderTextColor="#666"
              value={form.rating}
              onChangeText={(text) => setForm({ ...form, rating: text })}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={closeModal}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={saveMovie}
              >
                <Text style={styles.modalBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    backgroundColor: '#16213e',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    padding: 16,
  },
  movieCard: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  movieDirector: {
    fontSize: 14,
    color: '#a8a8a8',
    marginBottom: 8,
  },
  movieDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  movieYear: {
    fontSize: 14,
    color: '#e94560',
    fontWeight: '600',
  },
  movieRating: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#533483',
    padding: 10,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: '#e94560',
    padding: 10,
    borderRadius: 8,
  },
  btnText: {
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#e94560',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#16213e',
    margin: 20,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#533483',
  },
  saveBtn: {
    backgroundColor: '#e94560',
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});