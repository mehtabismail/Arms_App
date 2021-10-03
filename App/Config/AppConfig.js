import DeviceInfo from 'react-native-device-info';
import '../I18n/I18n';
import { Images } from '../Themes';
import RNFetchBlob from 'rn-fetch-blob';
import { Platform } from 'react-native';
import CustConfig from './CustConfig';

const folder_path_prefix = (Platform.OS=="android") ? "file://" : "";
const ads_dashboard_screen_id = 'home_btm_vertical';
const ads_login_screen_id = 'login_top_vertical';
const ads_promo_screen_id = 'promo_top_vertical';
const ads_promo_prod_screen_id = 'promo_product_top_vertical';
const ads_voucher_screen_id = 'voucher_top_vertical';

const {
  access_token,
  api_url, 
  app_display_name, 
  sender_id, 
  company_name, 
  company_logo_url, 
  company_logo_local,
} = CustConfig;

export default {
  /** Customer Config **/
  access_token, 
  api_url,
  app_display_name,
  sender_id,
  company_name,
  company_logo_default: Images.company_logo, // To change Customer Company Logo, Replace the file in Asset/Logo/logo.png. Take note that the logo name must be logo.png.
  company_logo_url,
  company_logo_local,
  sh_api_url: `api/mobileapp/rcv_action/`, // Sellerhub API URL.

  /** Profile Image Config **/
  profile_image_default: Images.user,
  profile_image_local: `${RNFetchBlob.fs.dirs.DocumentDir}/profile_image`,

  /** General Config **/
  Allow_Text_Font_Scaling: true, // font scaling override - RN default is on
  app_name: 'member', // app name use in communicate with ARMS Internal API
  db_name: 'ARMSMembership.db',
  latest_db_version: 11, // Update + 1 for the database latest version when data table has been modified.
  hash_prefix: 'Arms2018',
  device_uuid: DeviceInfo.getUniqueId(),
  app_version: DeviceInfo.getVersion(),
  prefix_currency: 'RM',

  /** Ads Banner Folders Path Config **/
  folder_path_prefix,
  ads_dashboard_screen_id,
  ads_login_screen_id,
  ads_promo_screen_id,
  ads_promo_prod_screen_id,
  ads_voucher_screen_id,
  ads_banner_dashboard_scn_path: `${RNFetchBlob.fs.dirs.DocumentDir}/ads_banners/${ads_dashboard_screen_id}`,
  ads_banner_login_scn_path: `${RNFetchBlob.fs.dirs.DocumentDir}/ads_banners/${ads_login_screen_id}`,
  ads_banner_promo_scn_path: `${RNFetchBlob.fs.dirs.DocumentDir}/ads_banners/${ads_promo_screen_id}`,
  ads_banner_promo_product_scn_path: `${RNFetchBlob.fs.dirs.DocumentDir}/ads_banners/${ads_promo_prod_screen_id}`,
  ads_banner_voucher_scn_path: `${RNFetchBlob.fs.dirs.DocumentDir}/ads_banners/${ads_voucher_screen_id}`,
}
