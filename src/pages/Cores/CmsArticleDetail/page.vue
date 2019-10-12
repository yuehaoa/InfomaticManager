<template>
    <i-row id="article-detail" :gutter="16">
        <i-col span="19">
            <i-card>
                <i-input size="large" placeholder="文章标题" v-model="article.Topic" />
                <div class="optional">
                    <Checkbox v-model="article.IsOutLink">
                        是否外链
                        <i-tooltip content="点击后跳转到一个新页面。">
                            <i-icon type="md-help-circle" />
                        </i-tooltip>
                    </Checkbox>
                    <Checkbox v-model="article.IsDisplay">
                        是否显示
                        <i-tooltip content="是否显示在前台页面上。">
                            <i-icon type="md-help-circle" />
                        </i-tooltip>
                    </Checkbox>
                    <Checkbox v-model="article.TopMost">
                        是否置顶
                        <i-tooltip content="新闻将永久在最顶上。">
                            <i-icon type="md-help-circle" />
                        </i-tooltip>
                    </Checkbox>
                    <Checkbox v-model="article.IsLocked" :true-value="1" :false-value="0">
                        是否锁定
                        <i-tooltip content="锁定则无法评论。">
                            <i-icon type="md-help-circle" />
                        </i-tooltip>
                    </Checkbox>
                </div>
                <i-input placeholder="请输入外链" v-show="article.IsOutLink" v-model="article.OutLink" />
                <div class="optional">
                    <ueditor :config="config" v-model="article.Content" style="width: 100%" />
                </div>
                <div class="mt20">
                    <i-button type="primary" @click="saveData">提交</i-button>
                    <i-button @click="cancel">取消</i-button>
                </div>
            </i-card>
        </i-col>
        <i-col span="5">
            <i-card title="基本信息">
                <i-form :model="article" :label-width="80">
                    <i-form-item label="所属分类">
                        <category-selector v-model="article.CategoryId" :placeholder="article.CategoryName" :clearable="true" />
                    </i-form-item>
                    <i-form-item label="作者">
                        <i-input v-model="article.Author" />
                    </i-form-item>
                    <i-form-item label="发布时间">
                        <i-date-picker v-model="article.ReleaseTime" style="width: 100%;" />
                    </i-form-item>
                    <i-form-item label="关键字">
                        <i-input v-model="article.Keywords" />
                    </i-form-item>
                    <i-form-item label="排序号">
                        <i-input-number v-model="article.DisplayOrder" />
                        <p>先排置顶内容，再按<b>发布时间</b>降序，最后按排序号<b>降序</b>排列。</p>
                    </i-form-item>
                    <i-form-item label="摘要">
                        <i-input v-model="article.Abstract" type="textarea" />
                    </i-form-item>
                    <i-form-item>
                        <i-button type="primary" @click="saveData">提交</i-button>
                        <i-button @click="cancel">取消</i-button>
                    </i-form-item>
                </i-form>
            </i-card>
            <i-card title="封面图片" class="mt20">
                <avatar-uploader :width="1920" :height="1080" :displayWidth="300"
                :displayHeight="170" usage="head-image" :needCrop="false"
                v-model="article.FeaturedImage" />
            </i-card>
        </i-col>
    </i-row>
</template>

<script>
let app = require("@/config");
let axios = require("axios");
export default {
    methods: {
        getData () {
            let id = this.$route.query.id;
            axios.post("/api/cms/GetArticleById", { id }, msg => {
                if (msg.success) {
                    this.article = msg.data;
                } else {
                    this.$Message.warning(msg.msg);
                }
            })
        },
        saveData () {
            axios.postStream("/api/cms/SaveArticle", this.article, msg => {
                if (msg.success) {
                    this.$Message.warning("保存成功");
                    this.$router.push({ name: "ArticleList" })
                } else {
                    this.$Message.warning("保存失败：" + msg.details.join(','));
                }
            })
        },
        cancel () {
            this.$router.push({ name: "ArticleList" })
        }
    },
    data () {
        return {
            article: {},
            config: {
                ...app.ueditor,
                initialFrameHeight: 800
            },
            showEditor: false
        };
    },
    mounted () {
        app.title = "新闻详细";
        this.getData();
    }
}
</script>

<style lang="less">
#article-detail {
    .optional {
        margin: 8px 0px;
    }
}
</style>
