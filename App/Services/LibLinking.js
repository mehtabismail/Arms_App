/**
 * Themes Folder
 */
import Colors from '../Themes/Colors';
import Fonts from '../Themes/Fonts';
import Metrics from '../Themes/Metrics';
import Images from '../Themes/Images';
import ApplicationStyles from '../Themes/ApplicationStyles';

/**
 * Components Folder
 */
import ARMSTextInput from '../Components/TextInputComponent';
import AppsButton from '../Components/AppsButton';
import AdsBanner from '../Components/AdsBanner';
import Barcode from '../Components/Barcode';
import Divider from '../Components/Divider';
import DiscountLabel from '../Components/DiscountLabel';
import ExpandCollapseAnimation from '../Components/ExpandCollapseAnimation';
import FadeInAnimation from '../Components/FadeInAnimation';
import HorizontalScrollAnimation from '../Components/HorizontalScrollAnimation';
import Label from '../Components/LabelComponent';
import LoadingIndicator from '../Components/LoadingIndicator';
import Rating from '../Components/Rating';
import SmallBadge from '../Components/SmallBadge';
import SpringAnimation from '../Components/SpringAnimation';

/**
 * I18n Folder
 */
import I18n from "../I18n";

/**
 * Config Folder
 */
import AppConfig from '../Config/AppConfig';
import ScreenTagConfig from '../Config/ScreenTagConfig';
const {ScreenTag, ScreenTagTo} = ScreenTagConfig;
/**
 * Services
 */
import ARMSDownloader from './arms_downloader';
import ServerCommunicator from './server_communicator';
import WorldTimeAPICommunicator from './world_time_api_communicator';

/**
 * Database
 */
import Database from '../Database/database';

/**
 * Export functions
 */
export { 
  // Themes
  Colors, Fonts, Images, Metrics, ApplicationStyles,

  // Components
  ARMSTextInput, AppsButton, AdsBanner,
  Barcode,
  Divider, DiscountLabel,
  ExpandCollapseAnimation,
  FadeInAnimation,
  HorizontalScrollAnimation,
  Label, LoadingIndicator, 
  Rating,
  SmallBadge,
  SpringAnimation,
  
  // I18n
  I18n,

  // Config
  AppConfig, ScreenTag, ScreenTagTo,

  // Services
  ARMSDownloader, ServerCommunicator, WorldTimeAPICommunicator,

  // Database
  Database,
};