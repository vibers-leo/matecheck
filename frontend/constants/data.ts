export const AVATARS = [
    // Simple Line Art Style (Open Peeps)
    { id: 0, emoji: '👦', label: '메이트 1', image: { uri: 'https://api.dicebear.com/9.x/open-peeps/png?seed=Felix&backgroundColor=f3f4f6' } },
    { id: 1, emoji: '👧', label: '메이트 2', image: { uri: 'https://api.dicebear.com/9.x/open-peeps/png?seed=Aneka&backgroundColor=f3f4f6' } },
    { id: 2, emoji: '🧑', label: '메이트 3', image: { uri: 'https://api.dicebear.com/9.x/open-peeps/png?seed=Mason&backgroundColor=f3f4f6' } },
    { id: 3, emoji: '👩', label: '메이트 4', image: { uri: 'https://api.dicebear.com/9.x/open-peeps/png?seed=Sara&backgroundColor=f3f4f6' } },
    { id: 4, emoji: '👨', label: '메이트 5', image: { uri: 'https://api.dicebear.com/9.x/open-peeps/png?seed=Jake&backgroundColor=f3f4f6' } },
    { id: 5, emoji: '👵', label: '메이트 6', image: { uri: 'https://api.dicebear.com/9.x/open-peeps/png?seed=Betty&backgroundColor=f3f4f6' } },

    // Simple Doodles / Animals
    { id: 6, emoji: '🐶', label: '강아지', image: { uri: 'https://api.dicebear.com/9.x/dylan/png?seed=Puppy&backgroundColor=f3f4f6' } },
    { id: 7, emoji: '🐱', label: '고양이', image: { uri: 'https://api.dicebear.com/9.x/dylan/png?seed=Kitty&backgroundColor=f3f4f6' } },
    { id: 8, emoji: '🪴', label: '식물', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Plant&backgroundColor=f3f4f6' } },
    { id: 9, emoji: '🤖', label: '로봇', image: { uri: 'https://api.dicebear.com/9.x/bottts-neutral/png?seed=Mate&backgroundColor=f3f4f6' } },
];

export const NEST_AVATARS = [
    { id: 100, emoji: '🏠', label: '코지 하우스', image: require('../assets/nests/nest_house.png') },
    { id: 101, emoji: '🏢', label: '심플 아파트', image: require('../assets/nests/nest_apartment.png') },
    { id: 102, emoji: '🪐', label: '우리 행성', image: require('../assets/nests/nest_planet.png') },
    { id: 103, emoji: '🏠', label: '포근 개집', image: require('../assets/nests/nest_doghouse.png') },
];

export const THEMES: Record<string, { color: string, bg: string, emoji: string }> = {
    'theme_cozy': { color: 'bg-orange-100', bg: 'bg-orange-50', emoji: '🧡' },
    'theme_cool': { color: 'bg-blue-100', bg: 'bg-blue-50', emoji: '💙' },
    'theme_nature': { color: 'bg-green-100', bg: 'bg-green-50', emoji: '💚' },
    'theme_dream': { color: 'bg-purple-100', bg: 'bg-purple-50', emoji: '💜' },
};
