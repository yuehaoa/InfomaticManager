import AvatarUploader from './AvatarUploader'
import MobileVerify from './MobileVerify'
import CategorySelector from './CategorySelector'
import UEditor from './UEditor/components/vue-ueditor-wrap.vue'
const installer = {
    install: function (Vue) {
        Vue.component("avatar-uploader", AvatarUploader);
        Vue.component("mobile-verify", MobileVerify);
        Vue.component("category-selector", CategorySelector);
        Vue.component("ueditor", UEditor);
    }
}

export default installer
