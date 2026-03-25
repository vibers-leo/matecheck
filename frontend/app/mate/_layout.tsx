import React, { useEffect } from "react";
import "../../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useUserStore } from "../../store/userStore";

export default function Layout() {
    const { setAppMode } = useUserStore();

    useEffect(() => {
        setAppMode('matecheck');
    }, []);

    return (
        <>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    );
}
