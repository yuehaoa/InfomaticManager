import AvatarUploader from './AvatarUploader'
import MobileVerify from './MobileVerify'
import CategorySelector from './CategorySelector'
import UEditor from './UEditor/components/vue-ueditor-wrap.vue'
import UserSelector from './UserSelector'
import OrgSelector from './OrgSelector'
import DictionarySelect from './DictionarySelect'
const installer = {
    install: function (Vue) {
        Vue.component("avatar-uploader", AvatarUploader);
        Vue.component("mobile-verify", MobileVerify);
        Vue.component("category-selector", CategorySelector);
        Vue.component("ueditor", UEditor);
        Vue.component("user-selector", UserSelector);
        Vue.component("org-selector", OrgSelector);
        Vue.component("dic-select", DictionarySelect);
    }
}

export default installer
