// app/trip/[id].tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import SafeMapView from '@/components/SafeMapView';
import { tripDb } from '@/database';

interface Trip {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    activities: any[];
}

interface Location {
    id: string;
    name: string;
    description: string;
    coordinate: {
        latitude: number;
        longitude: number;
    };
}

export default function TripDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<{latitude: number, longitude: number} | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');
    const [newLocationDescription, setNewLocationDescription] = useState('');

    useEffect(() => {
        loadTripDetails();
    }, [id]);

    const loadTripDetails = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const tripDetail = await tripDb.getTripById(Number(id));
            setTrip(tripDetail);

            const tripLocations = await tripDb.getTripLocations(Number(id));
            setLocations(tripLocations || []);
        } catch (error) {
            console.error('Erreur lors du chargement du voyage:', error);
            Alert.alert('Erreur', 'Impossible de charger les détails du voyage');
        } finally {
            setLoading(false);
        }
    };

    const handleMapPress = (event: any) => {
        const { coordinate } = event.nativeEvent;
        setSelectedLocation(coordinate);
        setModalVisible(true);
    };

    const saveNewLocation = async () => {
        if (!selectedLocation || !newLocationName || !trip) return;

        try {
            const newLocation = {
                id: Date.now().toString(),
                tripId: trip.id,
                name: newLocationName,
                description: newLocationDescription,
                coordinate: selectedLocation
            };

            await tripDb.addLocationToTrip(trip.id, newLocation);

            setLocations([...locations, newLocation]);
            setModalVisible(false);
            setNewLocationName('');
            setNewLocationDescription('');
            setSelectedLocation(null);

            Alert.alert('Succès', 'Nouvelle étape ajoutée au voyage');
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'étape:', error);
            Alert.alert('Erreur', 'Impossible d\'ajouter cette étape');
        }
    };

    if (loading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b5998" />
                <ThemedText style={styles.loadingText}>Chargement...</ThemedText>
            </ThemedView>
        );
    }

    if (!trip) {
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText>Voyage introuvable</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#3b5998" />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.title}>{trip.name}</ThemedText>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.mapContainer}>
                    <ThemedText style={styles.sectionTitle}>Carte des étapes</ThemedText>
                    <ThemedText style={styles.helpText}>
                        Cliquez sur la carte pour ajouter une nouvelle étape à votre voyage
                    </ThemedText>

                    <SafeMapView
                        style={styles.map}
                        markers={locations.map(loc => ({
                            id: loc.id,
                            coordinate: loc.coordinate,
                            title: loc.name,
                            description: loc.description,
                            pinColor: '#3b5998'
                        }))}
                        selectedLocation={selectedLocation}
                        onMapPress={handleMapPress}
                    />
                </View>

                <View style={styles.locationsList}>
                    <ThemedText style={styles.sectionTitle}>Liste des étapes ({locations.length})</ThemedText>
                    {locations.length === 0 ? (
                        <View style={styles.emptyLocations}>
                            <Ionicons name="location-outline" size={50} color="#ccc" />
                            <ThemedText style={styles.emptyText}>
                                Aucune étape pour ce voyage
                            </ThemedText>
                            <ThemedText style={styles.emptySubtext}>
                                Cliquez sur la carte pour ajouter votre première étape
                            </ThemedText>
                        </View>
                    ) : (
                        locations.map(location => (
                            <View key={location.id} style={styles.locationItem}>
                                <View style={styles.locationMarker}>
                                    <Ionicons name="location" size={24} color="#3b5998" />
                                </View>
                                <View style={styles.locationInfo}>
                                    <ThemedText style={styles.locationName}>{location.name}</ThemedText>
                                    <ThemedText style={styles.locationDescription}>
                                        {location.description || 'Aucune description'}
                                    </ThemedText>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>Ajouter une étape</ThemedText>

                        <ThemedText style={styles.label}>Nom de l'étape</ThemedText>
                        <TextInput
                            style={styles.input}
                            value={newLocationName}
                            onChangeText={setNewLocationName}
                            placeholder="ex: Tour Eiffel, Musée, Restaurant..."
                        />

                        <ThemedText style={styles.label}>Description (optionnelle)</ThemedText>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={newLocationDescription}
                            onChangeText={setNewLocationDescription}
                            placeholder="Notes ou détails supplémentaires"
                            multiline={true}
                            numberOfLines={4}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setModalVisible(false);
                                    setSelectedLocation(null);
                                }}
                            >
                                <ThemedText style={styles.cancelButtonText}>Annuler</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={saveNewLocation}
                                disabled={!newLocationName}
                            >
                                <ThemedText style={styles.saveButtonText}>Enregistrer</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    mapContainer: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    helpText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    map: {
        height: 300,
        borderRadius: 12,
        marginBottom: 20,
    },
    locationsList: {
        padding: 16,
    },
    emptyLocations: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 15,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    locationItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    locationMarker: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    locationDescription: {
        fontSize: 14,
        color: '#666',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 500,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        marginBottom: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#f1f1f1',
    },
    saveButton: {
        backgroundColor: '#3b5998',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});