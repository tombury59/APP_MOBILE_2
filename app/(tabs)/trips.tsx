import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { tripDb } from '@/database';

// Type pour les voyages
interface Trip {
    id: number;
    userId: number;
    destinationId: number;
    name: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    activities: any[];
}

export default function TripsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTrips();
    }, [user]);

    const loadTrips = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const userTrips = await tripDb.getTripsByUserId(user.id);
            console.log('Voyages chargés:', userTrips);
            setTrips(userTrips);
        } catch (error) {
            console.error('Erreur lors du chargement des voyages:', error);
            Alert.alert('Erreur', 'Impossible de charger vos voyages');
        } finally {
            setLoading(false);
        }
    };

    const handleTripPress = (trip: Trip) => {
        router.push(`/trip/${trip.id}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const calculateDuration = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getRandomImage = (seed: number) => {
        const images = [
            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
            'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
            'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4',
            'https://images.unsplash.com/photo-1530521954074-e64f6810b32d',
            'https://images.unsplash.com/photo-1501785888041-af3ef285b470'
        ];
        return images[seed % images.length];
    };

    return (
        <ProtectedRoute>
            <ThemedView style={styles.container}>
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>Mes Voyages</ThemedText>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push('/(tabs)/explore')}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3b5998" />
                        <ThemedText style={styles.loadingText}>Chargement de vos voyages...</ThemedText>
                    </View>
                ) : trips.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="airplane-outline" size={80} color="#ccc" />
                        <ThemedText style={styles.emptyText}>Vous n'avez pas encore de voyages</ThemedText>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => router.push('/(tabs)/explore')}
                        >
                            <ThemedText style={styles.createButtonText}>Créer un voyage</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={trips}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                style={styles.tripCard}
                                onPress={() => handleTripPress(item)}
                                activeOpacity={0.7}
                            >
                                <Image
                                    source={{ uri: getRandomImage(index) }}
                                    style={styles.tripImage}
                                />
                                <View style={styles.tripInfo}>
                                    <ThemedText style={styles.tripName}>{item.name}</ThemedText>

                                    <View style={styles.tripDetails}>
                                        <View style={styles.detailItem}>
                                            <Ionicons name="calendar-outline" size={16} color="#666" />
                                            <ThemedText style={styles.detailText}>
                                                {formatDate(item.startDate)} - {formatDate(item.endDate)}
                                            </ThemedText>
                                        </View>

                                        <View style={styles.detailItem}>
                                            <Ionicons name="time-outline" size={16} color="#666" />
                                            <ThemedText style={styles.detailText}>
                                                {calculateDuration(item.startDate, item.endDate)} jours
                                            </ThemedText>
                                        </View>

                                        <View style={styles.detailItem}>
                                            <Ionicons name="map-outline" size={16} color="#666" />
                                            <ThemedText style={styles.detailText}>
                                                {item.activities.length} activités
                                            </ThemedText>
                                        </View>
                                    </View>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={24}
                                    color="#3b5998"
                                    style={styles.chevron}
                                />
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </ThemedView>
        </ProtectedRoute>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#3b5998',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 20,
        marginBottom: 30,
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: '#3b5998',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 20,
    },
    tripCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'row',
    },
    tripImage: {
        width: 100,
        height: 'auto',
        resizeMode: 'cover',
    },
    tripInfo: {
        flex: 1,
        padding: 12,
    },
    tripName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    tripDetails: {
        gap: 4,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
    },
    chevron: {
        alignSelf: 'center',
        marginRight: 10,
    },
});