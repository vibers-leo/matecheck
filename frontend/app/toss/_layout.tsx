import React, { useEffect, useState } from "react";
import "../../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useUserStore } from "../../store/userStore";
import TossNavBar from "../../components/TossNavBar";

export default function Layout() {
    const { setAppMode } = useUserStore();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setAppMode('roommatecheck');
        setHydrated(true);
    }, []);

    if (!hydrated) return null;

    return (
        <>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#F2F4F6' }, // Setup Toss grey background globally
                    animation: 'slide_from_right',
                }}
            />
        </>
    );
}
