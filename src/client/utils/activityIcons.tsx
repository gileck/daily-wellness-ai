import React from 'react';
import { SvgIconProps } from '@mui/material/SvgIcon';

// Import Material UI icons that exist in the library
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import DirectionsRun from '@mui/icons-material/DirectionsRun';
import LocalDrink from '@mui/icons-material/LocalDrink';
import Restaurant from '@mui/icons-material/Restaurant';
import Bedtime from '@mui/icons-material/Bedtime';
import Bed from '@mui/icons-material/Bed';
import SelfImprovement from '@mui/icons-material/SelfImprovement';
import Work from '@mui/icons-material/Work';
import School from '@mui/icons-material/School';
import DirectionsWalk from '@mui/icons-material/DirectionsWalk';
import Pool from '@mui/icons-material/Pool';
import SportsBasketball from '@mui/icons-material/SportsBasketball';
import MoodIcon from '@mui/icons-material/Mood';
import HealthAndSafety from '@mui/icons-material/HealthAndSafety';
import DirectionsBike from '@mui/icons-material/DirectionsBike';
import SportsTennis from '@mui/icons-material/SportsTennis';
import SportsFootball from '@mui/icons-material/SportsFootball';
import SportsBaseball from '@mui/icons-material/SportsBaseball';
import SportsGolf from '@mui/icons-material/SportsGolf';
import SportsVolleyball from '@mui/icons-material/SportsVolleyball';
import SportsHockey from '@mui/icons-material/SportsHockey';
import SportsHandball from '@mui/icons-material/SportsHandball';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import Coffee from '@mui/icons-material/Coffee';
import LocalBar from '@mui/icons-material/LocalBar';
import LocalCafe from '@mui/icons-material/LocalCafe';
import Fastfood from '@mui/icons-material/Fastfood';
import LocalPizza from '@mui/icons-material/LocalPizza';
import Cake from '@mui/icons-material/Cake';
import MenuBook from '@mui/icons-material/MenuBook';
import LibraryBooks from '@mui/icons-material/LibraryBooks';
import AutoStories from '@mui/icons-material/AutoStories';
import Computer from '@mui/icons-material/Computer';
import Smartphone from '@mui/icons-material/Smartphone';
import Tv from '@mui/icons-material/Tv';
import VideogameAsset from '@mui/icons-material/VideogameAsset';
import Movie from '@mui/icons-material/Movie';
import MusicNote from '@mui/icons-material/MusicNote';
import Headphones from '@mui/icons-material/Headphones';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Brush from '@mui/icons-material/Brush';
import Build from '@mui/icons-material/Build';
import Home from '@mui/icons-material/Home';
import CleaningServices from '@mui/icons-material/CleaningServices';
import LocalLaundryService from '@mui/icons-material/LocalLaundryService';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import AttachMoney from '@mui/icons-material/AttachMoney';
import CreditCard from '@mui/icons-material/CreditCard';
import AccountBalance from '@mui/icons-material/AccountBalance';
import Business from '@mui/icons-material/Business';
import Group from '@mui/icons-material/Group';
import Person from '@mui/icons-material/Person';
import Call from '@mui/icons-material/Call';
import Email from '@mui/icons-material/Email';
import Chat from '@mui/icons-material/Chat';
import VideoCall from '@mui/icons-material/VideoCall';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import Train from '@mui/icons-material/Train';
import Flight from '@mui/icons-material/Flight';
import Hotel from '@mui/icons-material/Hotel';
import LocationOn from '@mui/icons-material/LocationOn';
import Nature from '@mui/icons-material/Nature';
import Park from '@mui/icons-material/Park';
import Hiking from '@mui/icons-material/Hiking';
import Pets from '@mui/icons-material/Pets';
import LocalHospital from '@mui/icons-material/LocalHospital';
import Healing from '@mui/icons-material/Healing';
import LocalPharmacy from '@mui/icons-material/LocalPharmacy';
import MonitorWeight from '@mui/icons-material/MonitorWeight';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Thermostat from '@mui/icons-material/Thermostat';
import WbSunny from '@mui/icons-material/WbSunny';
import Cloud from '@mui/icons-material/Cloud';
import AcUnit from '@mui/icons-material/AcUnit';
import Celebration from '@mui/icons-material/Celebration';
import Event from '@mui/icons-material/Event';
import Schedule from '@mui/icons-material/Schedule';
import Timer from '@mui/icons-material/Timer';
import Alarm from '@mui/icons-material/Alarm';
import Star from '@mui/icons-material/Star';
import Flag from '@mui/icons-material/Flag';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Assignment from '@mui/icons-material/Assignment';
import NoteAdd from '@mui/icons-material/NoteAdd';
import CreateIcon from '@mui/icons-material/Create';
import Spa from '@mui/icons-material/Spa';
import LocalLibrary from '@mui/icons-material/LocalLibrary';
import PaletteOutlined from '@mui/icons-material/PaletteOutlined';
import SportsEsports from '@mui/icons-material/SportsEsports';
import CameraAlt from '@mui/icons-material/CameraAlt';
import BusinessCenter from '@mui/icons-material/BusinessCenter';
import Phone from '@mui/icons-material/Phone';

// Comprehensive map of icon names to actual icon components
export const ACTIVITY_ICON_MAP: Record<string, React.ComponentType<SvgIconProps>> = {
    // Fitness & Sports
    FitnessCenter,
    DirectionsRun,
    DirectionsWalk,
    DirectionsBike,
    Pool,
    SportsTennis,
    SportsFootball,
    SportsBaseball,
    SportsGolf,
    SportsVolleyball,
    SportsHockey,
    SportsHandball,
    SportsSoccer,
    SportsBasketball,
    Hiking,

    // Food & Drink
    Restaurant,
    LocalDrink,
    Coffee,
    LocalBar,
    LocalCafe,
    Fastfood,
    LocalPizza,
    Cake,

    // Health & Wellness
    HealthAndSafety,
    LocalHospital,
    Healing,
    LocalPharmacy,
    MonitorWeight,
    FavoriteIcon,
    Thermostat,
    SelfImprovement,
    MoodIcon,
    Bedtime,
    Bed,
    Spa,

    // Work & Education
    Work,
    School,
    MenuBook,
    LibraryBooks,
    AutoStories,
    Computer,
    Business,
    Assignment,
    NoteAdd,
    CreateIcon,
    BusinessCenter,
    LocalLibrary,

    // Technology & Entertainment
    Smartphone,
    Tv,
    VideogameAsset,
    Movie,
    MusicNote,
    Headphones,
    PhotoCamera,
    SportsEsports,

    // Home & Personal
    Home,
    CleaningServices,
    LocalLaundryService,
    ShoppingCart,
    Brush,
    Build,

    // Social & Communication
    Group,
    Person,
    Call,
    Email,
    Chat,
    VideoCall,
    Phone,

    // Travel & Transportation
    DirectionsCar,
    Train,
    Flight,
    Hotel,
    LocationOn,

    // Nature & Environment
    Nature,
    Park,
    Pets,
    WbSunny,
    Cloud,
    AcUnit,

    // Financial
    AttachMoney,
    CreditCard,
    AccountBalance,

    // Events & Time
    Celebration,
    Event,
    Schedule,
    Timer,
    Alarm,

    // Creative & Arts
    PaletteOutlined,
    CameraAlt,

    // General
    Star,
    Flag,
    CheckCircle,
};

// Icon options for selection in dialogs/forms
export const ICON_OPTIONS = [
    { name: 'FitnessCenter', label: 'Exercise', component: FitnessCenter },
    { name: 'Restaurant', label: 'Food', component: Restaurant },
    { name: 'Bed', label: 'Sleep', component: Bed },
    { name: 'Work', label: 'Work', component: Work },
    { name: 'School', label: 'Learning', component: School },
    { name: 'Spa', label: 'Wellness', component: Spa },
    { name: 'DirectionsRun', label: 'Running', component: DirectionsRun },
    { name: 'LocalLibrary', label: 'Reading', component: LocalLibrary },
    { name: 'MusicNote', label: 'Music', component: MusicNote },
    { name: 'PaletteOutlined', label: 'Creative', component: PaletteOutlined },
    { name: 'SportsEsports', label: 'Gaming', component: SportsEsports },
    { name: 'CameraAlt', label: 'Photography', component: CameraAlt },
    { name: 'Pets', label: 'Pets', component: Pets },
    { name: 'LocalHospital', label: 'Health', component: LocalHospital },
    { name: 'BusinessCenter', label: 'Business', component: BusinessCenter },
    { name: 'Home', label: 'Home', component: Home },
    { name: 'DirectionsCar', label: 'Travel', component: DirectionsCar },
    { name: 'ShoppingCart', label: 'Shopping', component: ShoppingCart },
    { name: 'Phone', label: 'Social', component: Phone },
    { name: 'Tv', label: 'Entertainment', component: Tv },
];

/**
 * Gets the icon component for a given icon name
 * @param iconName - The name of the icon (e.g., "FitnessCenter", "Bed")
 * @returns React element or null if icon not found
 */
export const getActivityIcon = (iconName: string | undefined): React.ReactElement | null => {
    if (!iconName) return null;

    const IconComponent = ACTIVITY_ICON_MAP[iconName];
    if (IconComponent) {
        return <IconComponent />;
    }

    // Log unknown icons for debugging
    console.warn(`Unknown icon: ${iconName}. No matching icon found in ACTIVITY_ICON_MAP.`);
    return null;
};

/**
 * Gets the icon component with custom props
 * @param iconName - The name of the icon
 * @param props - Custom props to pass to the icon component
 * @returns React element or null if icon not found
 */
export const getActivityIconWithProps = (
    iconName: string | undefined,
    props?: SvgIconProps
): React.ReactElement | null => {
    if (!iconName) return null;

    const IconComponent = ACTIVITY_ICON_MAP[iconName];
    if (IconComponent) {
        return <IconComponent {...props} />;
    }

    console.warn(`Unknown icon: ${iconName}. No matching icon found in ACTIVITY_ICON_MAP.`);
    return null;
};

/**
 * Checks if an icon name exists in the icon map
 * @param iconName - The name of the icon to check
 * @returns true if icon exists, false otherwise
 */
export const hasActivityIcon = (iconName: string | undefined): boolean => {
    return !!iconName && !!ACTIVITY_ICON_MAP[iconName];
}; 