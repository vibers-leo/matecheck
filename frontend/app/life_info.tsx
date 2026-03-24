import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Linking, RefreshControl, Alert, TextInput, ActivityIndicator, Modal, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../constants/Config';
import { useUserStore } from '../store/userStore';
import Animated, { FadeInDown, FadeInUp, Layout, SlideInDown, SlideOutDown, FadeIn, FadeOut } from 'react-native-reanimated';

interface LifeInfo {
    id: number;
    title: string;
    content: string;
    category: string;
    image_url: string;
    source_url: string;
    published_at: string;
    target_audience: string;
    region?: string;
    min_age?: number;
    max_age?: number;
    gender?: string;
    occupation?: string;
}

const CATEGORIES = [
    { id: 'all', label: '전체', icon: 'apps', color: 'bg-gray-900', lightColor: 'bg-gray-100', textColor: 'text-gray-900' },
    { id: 'youth', label: '청년', icon: 'school', color: 'bg-blue-600', lightColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { id: 'farming', label: '귀농', icon: 'leaf', color: 'bg-green-600', lightColor: 'bg-green-50', textColor: 'text-green-600' },
    { id: 'family', label: '가족', icon: 'people', color: 'bg-pink-600', lightColor: 'bg-pink-50', textColor: 'text-pink-600' },
    { id: 'living', label: '생활', icon: 'bulb', color: 'bg-amber-600', lightColor: 'bg-amber-50', textColor: 'text-amber-600' },
];

const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
const OCCUPATIONS = [
    { id: 'student', label: '학생/취준생' },
    { id: 'employee', label: '직장인' },
    { id: 'entrepreneur', label: '사업가/소상공인' },
    { id: 'farmer', label: '농어업인' },
    { id: 'etc', label: '기타' }
];

const { width } = Dimensions.get('window');

export default function LifeInfoScreen() {
    const router = useRouter();
    const { userId, region, birthDate, gender, occupation, setDetailedProfile, addTodo, addEvent } = useUserStore();

    const [infos, setInfos] = useState<LifeInfo[]>([]);
    const [recommendedInfos, setRecommendedInfos] = useState<LifeInfo[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Profile Settings States
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [editRegion, setEditRegion] = useState(region || '');
    const [editBirthDate, setEditBirthDate] = useState(birthDate || '');
    const [editGender, setEditGender] = useState(gender || '');
    const [editOccupation, setEditOccupation] = useState(occupation || '');

    // Smart Save Modal States
    const [smartSaveVisible, setSmartSaveVisible] = useState(false);
    const [activeInfo, setActiveInfo] = useState<LifeInfo | null>(null);
    const [saveType, setSaveType] = useState<'todo' | 'event'>('event');
    const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
    const [leadTime, setLeadTime] = useState(0);

    const fetchInfos = async () => {
        try {
            const url = selectedCategory === 'all'
                ? `${API_URL}/life_infos`
                : `${API_URL}/life_infos?category=${selectedCategory}`;

            const response = await fetch(url);
            if (response.ok) {
                const json = await response.json();
                const data = Array.isArray(json) ? json : (json.data || []);
                setInfos(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchRecommended = async () => {
        if (!userId) return;
        try {
            const response = await fetch(`${API_URL}/life_infos/personalized?user_id=${userId}`);
            if (response.ok) {
                const json = await response.json();
                const data = Array.isArray(json) ? json : (json.data || []);
                setRecommendedInfos(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchInfos();
        fetchRecommended();
    }, [selectedCategory, region, occupation, birthDate]);

    const filteredInfos = useMemo(() => {
        if (!searchQuery.trim()) return infos;
        return infos.filter(info =>
            info.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            info.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [infos, searchQuery]);

    const handleSaveProfile = () => {
        setDetailedProfile(editRegion, editBirthDate, editGender as any, editOccupation);
        setProfileModalVisible(false);
        Alert.alert('저장 완료 ✨', '활동하신 내용을 바탕으로 맞춤형 정보를 추천해 드립니다.');
    };

    const openSmartSave = (info: LifeInfo, type: 'todo' | 'event') => {
        setActiveInfo(info);
        setSaveType(type);
        setSmartSaveVisible(true);
        setTargetDate(new Date().toISOString().split('T')[0]);
        setLeadTime(0);
    };

    const executeSmartSave = () => {
        if (!activeInfo) return;
        const dateObj = new Date(targetDate);
        dateObj.setDate(dateObj.getDate() - leadTime);
        const finalDate = dateObj.toISOString().split('T')[0];
        const titlePrefix = leadTime > 0 ? `[D-${leadTime} 전] ` : '';
        const title = `${titlePrefix}${activeInfo.title}`;

        if (saveType === 'todo') {
            addTodo(title, undefined, 'none', activeInfo.image_url);
            Alert.alert('✅ 할 일 저장 완료', '내 할 일 목록에 추가되었습니다.');
        } else {
            addEvent(title, finalDate, activeInfo.image_url);
            Alert.alert('📅 일정 등록 완료', `${finalDate} 날짜로 캘린더에 등록되었습니다.`);
        }
        setSmartSaveVisible(false);
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch(`${API_URL}/life_infos/sync`, { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                fetchInfos();
                fetchRecommended();
                Alert.alert('동기화 완료', `새로운 정보 ${data.count}건이 추가되었습니다.`);
            }
        } catch (error) {
            Alert.alert('오류', '네트워크 오류가 발생했습니다.');
        } finally {
            setIsSyncing(false);
        }
    };

    const openLink = async (url: string) => {
        if (!url) return;
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported || url.startsWith('http')) {
                await Linking.openURL(url);
            } else {
                Alert.alert('정보', '관리자에 의해 링크가 차단되었거나 유효하지 않은 주소입니다.');
            }
        } catch (error) {
            console.error(error);
            try {
                await Linking.openURL(url);
            } catch (innerError) {
                Alert.alert('알림', '브라우저를 여는 중 문제가 발생했습니다.');
            }
        }
    };

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            {/* Header */}
            <View className="pt-16 pb-4 px-6 bg-white shadow-sm">
                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
                            className="w-10 h-10 items-center justify-center rounded-full bg-gray-50 mr-3"
                        >
                            <Ionicons name="chevron-back" size={24} color="#1E293B" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-2xl font-black text-[#0F172A]">생활 정보 ✨</Text>
                            <Text className="text-xs text-gray-400 font-medium">나에게 꼭 필요한 혜택 찾기</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                            onPress={() => setProfileModalVisible(true)}
                            className="w-10 h-10 items-center justify-center rounded-full bg-indigo-50"
                        >
                            <Ionicons name="options" size={20} color="#6366F1" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSync}
                            disabled={isSyncing}
                            className={`w-10 h-10 items-center justify-center rounded-full ${isSyncing ? 'bg-gray-100' : 'bg-indigo-50'}`}
                        >
                            {isSyncing ? (
                                <ActivityIndicator size="small" color="#6366F1" />
                            ) : (
                                <Ionicons name="refresh" size={20} color="#6366F1" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4">
                    <Ionicons name="search" size={20} color="#94A3B8" />
                    <TextInput
                        className="flex-1 ml-3 text-[#1E293B] font-medium"
                        placeholder="키워드로 검색 (예: 지원금, 서울)"
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => setSelectedCategory(cat.id)}
                            className={`flex-row items-center px-5 py-2.5 rounded-2xl mr-2 border ${selectedCategory === cat.id ? 'bg-[#0F172A] border-[#0F172A]' : 'bg-white border-gray-100'}`}
                        >
                            <Ionicons name={cat.icon as any} size={16} color={selectedCategory === cat.id ? 'white' : '#64748B'} />
                            <Text className={`ml-2 font-bold ${selectedCategory === cat.id ? 'text-white' : 'text-[#64748B]'}`}>{cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* List */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6366F1" />
                </View>
            ) : (
                <ScrollView
                    className="flex-1 px-4 pt-4"
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchInfos(); }} tintColor="#6366F1" />}
                >
                    {/* Personalized Recommendations Section */}
                    {recommendedInfos.length > 0 && searchQuery === '' && selectedCategory === 'all' && (
                        <View className="mb-8">
                            <View className="flex-row items-center justify-between mb-4 px-2">
                                <View className="flex-row items-center">
                                    <Text className="text-xl font-black text-[#1E293B] mr-2">🎯 맞춤 추천</Text>
                                    <View className="bg-amber-100 px-2 py-0.5 rounded-md">
                                        <Text className="text-amber-700 text-[10px] font-black tracking-tighter">AI PICK</Text>
                                    </View>
                                </View>
                                {region ? (
                                    <Text className="text-gray-400 text-xs font-bold">{region} 거주 • {occupation || '전체'}</Text>
                                ) : (
                                    <TouchableOpacity onPress={() => setProfileModalVisible(true)}>
                                        <Text className="text-indigo-600 text-xs font-bold">프로필 설정하고 추천받기 {'>'}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                {recommendedInfos.map((info, idx) => (
                                    <TouchableOpacity
                                        key={`rec-${info.id}`}
                                        onPress={() => openSmartSave(info, 'event')}
                                        className="w-64 bg-white rounded-3xl p-4 mr-4 shadow-sm border border-indigo-50"
                                    >
                                        <View className="bg-indigo-500 w-8 h-8 rounded-full items-center justify-center mb-3">
                                            <Ionicons name="sparkles" size={16} color="white" />
                                        </View>
                                        <Text className="text-[#1E293B] font-black text-md mb-2" numberOfLines={2}>{info.title}</Text>
                                        <Text className="text-gray-400 text-xs font-medium" numberOfLines={2}>{info.content}</Text>
                                        <View className="mt-4 flex-row items-center justify-between">
                                            <View className="bg-indigo-50 px-2 py-1 rounded-lg">
                                                <Text className="text-indigo-600 text-[10px] font-bold"># {CATEGORIES.find(c => c.id === info.category)?.label}</Text>
                                            </View>
                                            <Ionicons name="arrow-forward-circle" size={24} color="#6366F1" />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <Text className="text-xl font-black text-[#1E293B] mb-4 px-2">📢 전체 소식</Text>
                    {filteredInfos.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="search-outline" size={40} color="#CBD5E1" />
                            <Text className="text-gray-500 font-bold mt-2">검색 결과가 없습니다</Text>
                        </View>
                    ) : (
                        filteredInfos.map((info, index) => {
                            const catInfo = CATEGORIES.find(c => c.id === info.category) || CATEGORIES[0];
                            return (
                                <Animated.View key={info.id} entering={FadeInDown.delay(index * 50).springify()} layout={Layout.springify()} className="bg-white rounded-[24px] mb-6 shadow-sm overflow-hidden border border-gray-50">
                                    {info.image_url ? <Image source={{ uri: info.image_url }} className="w-full h-44" resizeMode="cover" /> : null}
                                    <View className="p-6">
                                        <View className="flex-row justify-between items-center mb-3">
                                            <View className={`${catInfo.lightColor} px-2.5 py-1 rounded-lg`}>
                                                <Text className={`${catInfo.textColor} text-[11px] font-bold`}># {catInfo.label} {info.region ? `• ${info.region}` : ''}</Text>
                                            </View>
                                            <Text className="text-[#94A3B8] text-[11px] font-medium">{new Date(info.published_at).toLocaleDateString()}</Text>
                                        </View>
                                        <Text className="text-lg font-black text-[#1E293B] mb-3 leading-6" numberOfLines={2}>{info.title}</Text>
                                        <Text className="text-[#64748B] text-sm leading-6 mb-6" numberOfLines={3}>{info.content}</Text>
                                        <View className="flex-row gap-2 border-t border-gray-50 pt-5">
                                            <TouchableOpacity onPress={() => openSmartSave(info, 'todo')} className="flex-1 flex-row items-center justify-center bg-indigo-50 h-12 rounded-2xl">
                                                <Ionicons name="add-circle" size={18} color="#6366F1" /><Text className="ml-2 font-bold text-[#6366F1]">기록하기</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => openSmartSave(info, 'event')} className="flex-1 flex-row items-center justify-center bg-emerald-50 h-12 rounded-2xl">
                                                <Ionicons name="calendar-sharp" size={18} color="#10B981" /><Text className="ml-2 font-bold text-[#10B981]">일정 등록</Text>
                                            </TouchableOpacity>
                                            {info.source_url && (
                                                <TouchableOpacity onPress={() => openLink(info.source_url)} className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl">
                                                    <Ionicons name="link" size={18} color="#475569" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </Animated.View>
                            );
                        })
                    )}
                    <View className="h-24" />
                </ScrollView>
            )}

            {/* Profile Setting Modal */}
            <Modal transparent visible={profileModalVisible} animationType="none">
                <View className="flex-1 justify-end">
                    <TouchableWithoutFeedback onPress={() => setProfileModalVisible(false)}>
                        <Animated.View entering={FadeIn} exiting={FadeOut} className="absolute inset-0 bg-black/60" />
                    </TouchableWithoutFeedback>
                    <Animated.View entering={SlideInDown.springify()} exiting={SlideOutDown} className="bg-white rounded-t-[40px] p-8 shadow-2xl">
                        <Text className="text-2xl font-black text-gray-900 mb-6">🎯 맞춤 정보 설정</Text>

                        <Text className="text-gray-900 font-bold mb-3">거주 지역</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6">
                            {REGIONS.map(r => (
                                <TouchableOpacity key={r} onPress={() => setEditRegion(r)} className={`px-4 py-2 rounded-xl mr-2 border ${editRegion === r ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-50 border-gray-100'}`}>
                                    <Text className={`font-bold ${editRegion === r ? 'text-white' : 'text-gray-400'}`}>{r}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text className="text-gray-900 font-bold mb-3">생년월일 (YYYY-MM-DD)</Text>
                        <TextInput className="bg-gray-50 rounded-2xl px-5 py-4 font-bold text-gray-900 mb-6" value={editBirthDate} onChangeText={setEditBirthDate} placeholder="1995-01-01" />

                        <Text className="text-gray-900 font-bold mb-3">직업</Text>
                        <View className="flex-row flex-wrap gap-2 mb-8">
                            {OCCUPATIONS.map(occ => (
                                <TouchableOpacity key={occ.id} onPress={() => setEditOccupation(occ.label)} className={`px-4 py-2 rounded-xl border ${editOccupation === occ.label ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-50 border-gray-100'}`}>
                                    <Text className={`font-bold ${editOccupation === occ.label ? 'text-white' : 'text-gray-400'}`}>{occ.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity onPress={handleSaveProfile} className="bg-[#0F172A] py-6 rounded-3xl items-center justify-center">
                            <Text className="text-white font-black text-lg">설정 완료 ✨</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

            {/* Smart Save Modal */}
            <Modal transparent visible={smartSaveVisible} animationType="fade" onRequestClose={() => setSmartSaveVisible(false)}>
                <View className="flex-1 justify-center items-center bg-white/90 px-4">
                    <TouchableWithoutFeedback onPress={() => setSmartSaveVisible(false)}>
                        <View className="absolute inset-0" />
                    </TouchableWithoutFeedback>

                    <Animated.View
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(200)}
                        className="bg-white rounded-[32px] p-6 shadow-2xl w-full max-w-[360px]"
                    >
                        <View className="items-center mb-6">
                            <View className="w-14 h-14 bg-indigo-50 rounded-full items-center justify-center mb-3">
                                <Ionicons name="calendar" size={28} color="#4F46E5" />
                            </View>
                            <Text className="text-xl font-black text-gray-900">스마트 일정 등록</Text>
                            <Text className="text-gray-500 text-xs mt-1">정책 알림을 언제 받으시겠어요?</Text>
                        </View>

                        {activeInfo && (
                            <View className="bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100 flex-row gap-3">
                                <View className="mt-1">
                                    {activeInfo.image_url ? (
                                        <Image source={{ uri: activeInfo.image_url }} className="w-10 h-10 rounded-lg bg-gray-200" />
                                    ) : (
                                        <View className="w-10 h-10 rounded-lg bg-white border border-gray-100 items-center justify-center">
                                            <Ionicons name="document-text" size={18} color="#6366F1" />
                                        </View>
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-bold text-sm leading-5 mb-1" numberOfLines={2}>{activeInfo.title}</Text>
                                    <View className="flex-row items-center">
                                        <View className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px]">
                                            <Text className="text-gray-500 text-[10px]">
                                                {activeInfo.category === 'youth' && '청년'}
                                                {activeInfo.category === 'farming' && '귀농'}
                                                {activeInfo.category === 'family' && '가족'}
                                                {activeInfo.category === 'living' && '생활'}
                                            </Text>
                                        </View>
                                        <Text className="text-gray-400 text-[10px] ml-1.5 overflow-hidden w-24" numberOfLines={1}>
                                            {activeInfo.region || '전국'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        <View className="mb-2">
                            <Text className="text-gray-900 font-bold text-sm mb-2 ml-1">기준 날짜</Text>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-12 mb-5">
                                <TextInput
                                    className="flex-1 font-bold text-gray-900 text-sm"
                                    value={targetDate}
                                    onChangeText={setTargetDate}
                                    placeholder="YYYY-MM-DD"
                                />
                                <Ionicons name="calendar-outline" size={20} color="#94A3B8" />
                            </View>

                            <Text className="text-gray-900 font-bold text-sm mb-2 ml-1">미리 알림 (D-Day)</Text>
                            <View className="flex-row gap-2 mb-6">
                                {[0, 1, 3, 7].map((val) => (
                                    <TouchableOpacity
                                        key={val}
                                        onPress={() => setLeadTime(val)}
                                        className={`flex-1 h-10 rounded-xl border items-center justify-center ${leadTime === val
                                            ? 'bg-indigo-600 border-indigo-600'
                                            : 'bg-white border-gray-200'
                                            }`}
                                    >
                                        <Text className={`font-bold text-xs ${leadTime === val ? 'text-white' : 'text-gray-600'}`}>
                                            {val === 0 ? '당일' : `${val}일`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setSmartSaveVisible(false)}
                                className="flex-1 py-3.5 rounded-xl bg-gray-100 items-center justify-center"
                            >
                                <Text className="text-gray-600 font-bold text-sm">취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={executeSmartSave}
                                className="flex-[2] py-3.5 rounded-xl bg-[#0F172A] items-center justify-center shadow-md shadow-indigo-100"
                            >
                                <Text className="text-white font-bold text-sm">등록하기</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
