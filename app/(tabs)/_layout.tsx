import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const { isAuthenticated } = useAuth();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: {
                        position: 'absolute',
                    },
                    default: {},
                }),
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Créer un voyage',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
                }}
            />

            <Tabs.Screen
                name="trips"
                options={{
                    title: 'Assigner des Trips',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="profil"
                options={{
                    title: 'Mon Compte',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
                }}
            />

            <Tabs.Screen
                name="login"
                options={{
                    title: 'Connexion',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.badge.plus" color={color} />,
                    href: isAuthenticated ? null : undefined,
                }}
            />

        </Tabs>
    );
}