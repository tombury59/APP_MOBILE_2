import React, { useState } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Alert, Platform } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { tripDb } from '@/database';

export default function ExploreScreen() {
    const [tripName, setTripName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { user } = useAuth();

    const handleCreateTrip = async () => {
        if (!tripName.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer un nom pour le voyage');
            return;
        }

        if (!startDate || !endDate) {
            Alert.alert('Erreur', 'Veuillez spécifier les dates de début et de fin');
            return;
        }

        try {
            // Convertir les dates du format français (JJ/MM/AAAA) au format JavaScript
            const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
            const [endDay, endMonth, endYear] = endDate.split('/').map(Number);

            // Ajustement des mois (en JavaScript, les mois commencent à 0)
            const startDateObj = new Date(startYear, startMonth - 1, startDay);
            const endDateObj = new Date(endYear, endMonth - 1, endDay);

            // Vérification de la validité des dates
            if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
                Alert.alert('Erreur', 'Format de date invalide. Utilisez le format JJ/MM/AAAA');
                return;
            }

            if (endDateObj < startDateObj) {
                Alert.alert('Erreur', 'La date de fin doit être après la date de début');
                return;
            }

            console.log('Création du voyage avec les valeurs suivantes:', {
                userId: user?.id || 0,
                destinationId: 1,
                name: tripName,
                startDate: startDateObj.toISOString(),
                endDate: endDateObj.toISOString()
            });

            // Vérifier si l'utilisateur est connecté
            if (!user) {
                Alert.alert('Erreur', 'Vous devez être connecté pour créer un voyage');
                return;
            }

            const newTrip = await tripDb.createTrip(
                user.id,
                1, // ID de destination par défaut
                tripName,
                startDateObj.toISOString(),
                endDateObj.toISOString()
            );

            console.log('Voyage créé:', newTrip);

            if (newTrip) {
                Alert.alert('Succès', 'Votre voyage a été créé avec succès');
                setTripName('');
                setStartDate('');
                setEndDate('');
            } else {
                throw new Error('La création du voyage a échoué');
            }
        } catch (error) {
            console.error('Erreur lors de la création du voyage:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la création du voyage');
        }
    };

    return (
        <ProtectedRoute>
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
                headerImage={
                    <IconSymbol
                        size={310}
                        color="#808080"
                        name="airplane"
                        style={styles.headerImage}
                    />
                }>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Créer un Voyage</ThemedText>
                </ThemedView>

                <ThemedView style={styles.formContainer}>
                    <ThemedText style={styles.label}>Nom du voyage</ThemedText>
                    <TextInput
                        style={styles.input}
                        value={tripName}
                        onChangeText={setTripName}
                        placeholder="Ex: Vacances d'été à Paris"
                        placeholderTextColor="#999"
                    />

                    <ThemedText style={styles.label}>Date de début (JJ/MM/AAAA)</ThemedText>
                    <TextInput
                        style={styles.input}
                        value={startDate}
                        onChangeText={setStartDate}
                        placeholder="Ex: 15/06/2024"
                        placeholderTextColor="#999"
                        keyboardType={Platform.OS === 'web' ? 'default' : 'numbers-and-punctuation'}
                        maxLength={10}
                    />

                    <ThemedText style={styles.label}>Date de fin (JJ/MM/AAAA)</ThemedText>
                    <TextInput
                        style={styles.input}
                        value={endDate}
                        onChangeText={setEndDate}
                        placeholder="Ex: 30/06/2024"
                        placeholderTextColor="#999"
                        keyboardType={Platform.OS === 'web' ? 'default' : 'numbers-and-punctuation'}
                        maxLength={10}
                    />

                    <View style={styles.formatHint}>
                        <ThemedText style={styles.hintText}>
                            Format: JJ/MM/AAAA (ex: 15/06/2024)
                        </ThemedText>
                    </View>

                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreateTrip}>
                        <ThemedText style={styles.buttonText}>Créer le Voyage</ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                <Collapsible title="Mes voyages">
                    <ThemedText>
                        Consultez vos voyages dans la section profil ou créez-en un nouveau ci-dessus.
                    </ThemedText>
                </Collapsible>
            </ParallaxScrollView>
        </ProtectedRoute>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    formatHint: {
        marginTop: 8,
        marginBottom: 8,
    },
    hintText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    createButton: {
        backgroundColor: '#3b5998',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});