import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <AuthProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="destination/[id]" options={{ headerShown: false }} />
            </Stack>
        </AuthProvider>
    );
}