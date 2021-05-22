const courseModel = require('./../models/course');
const userModel = require('./../models/user-info');
const { timetransfor } = require('./../utils/method');

const course = {
    /**
     *
     * 获得一级课程数组
     * @return {array}
     */
    async getCourse() {
        const courseData = await courseModel.getCourseList();
        let result = [],
            obj = {};
        for (let course of courseData) {
            obj[course['course_name']] = course['sub_course'].split(',');
            result.push(obj);
            obj = {};
        }
        return result;
    },

    /**
     *
     * 获得完整课程列表信息
     * @return {object}
     */
    async getCourseDetail() {
        const subCourseData = await courseModel.getCourseDetailList();
        let result = [],
            obj = {};
        for (let course of subCourseData) {
            obj[course['sub_course_name']] =
                course['sub_course_detail'].split(',');
            result.push(obj);
            obj = {};
        }
        const courses = await this.getCourse();
        //遍历course中的子课程数组,将子课程名换为键值对
        courses.forEach((element) => {
            for (let value of Object.values(element)) {
                //value为子课程数组
                value.forEach((name, index) => {
                    //从sub_course中根据课程名查找对应数据
                    let tmp = {};
                    tmp[name] = [];
                    result.forEach((item) => {
                        let searchName = Object.keys(item)[0];
                        if (searchName === name) {
                            tmp = item;
                            value[index] = tmp;
                        }
                    });
                });
            }
        });
        return courses;
    },

    async getCourseDetailById(id) {
        const result = await courseModel.getCourseDetailById(id);
        //将category转换为数组形式
        result.category = result.category.split(',');
        if (result) {
            return result;
        }
    },

    async getCourseIds() {
        const result = await courseModel.getCourseIds();
        console.log(result);
    },

    async getUserCourses(user_id) {
        const result = await courseModel.getUserCourses(user_id);
        if (result) {
            return result;
        }
    },

    async signUpCourse(userId, courseId) {
        const result = await courseModel.signUpCourse(userId, courseId);
        const res = await courseModel.createOrder(userId, courseId);
        return result;
    },

    async getCourseMainInfo(userId, courseId) {
        const { catalog, progress, comment } =
            await courseModel.getCourseMainInfo(userId, courseId);
        const info = {
            courseLength: catalog.length,
            learned: 0,
        };
        //用二维对象数组表示目录结构[[chapter1(array-object)][chapter2]]
        const res_catalog = [];
        const maxChapter = catalog[catalog.length - 1].chapter;
        for (let chapter = 1; chapter <= maxChapter; chapter++) {
            let tmpChapter = [];
            for (let i = 0; i < catalog.length; i++) {
                if (catalog[i].chapter === chapter) {
                    const lessonProgress = this.getCourseProgress(
                        progress,
                        catalog[i].lessonId
                    );
                    //进度为1表示已完成
                    if (lessonProgress === 1) {
                        info.learned++;
                    }
                    catalog[i].progress = lessonProgress;
                    tmpChapter.push(catalog[i]);
                }
            }
            res_catalog.push(tmpChapter);
        }
        //在comment中添加用户头像,用户名
        for (let user of comment) {
            const userData = await userModel.getUserInfoById(user.userId);
            const avatar = userData.avatar;
            const username = userData.name;
            user.avatar = avatar;
            user.username = username;
            user.learned = info.learned;
        }

        const result = { res_catalog, comment, info };
        return result;
    },

    async collectCourse(userId, courseId) {
        let updateVal = {};
        const userInfo = await userModel.getUserInfoById(userId);
        const collectVal = userInfo.collect;
        if (collectVal) {
            const collectArr = collectVal.split(',');
            const index = collectArr.indexOf(courseId);
            if (index !== -1) {
                //如果已经包含了课程，取消收藏
                collectArr.splice(index, 1);
                updateVal.collect = collectArr.join(',');
            } else {
                updateVal.collect = collectVal + ',' + courseId;
            }
        } else {
            updateVal.collect = courseId;
        }
        const res = await courseModel.collectCourse(userId, updateVal);
        return res;
    },

    getCourseProgress(progress, lessonId) {
        for (let obj of progress) {
            if (obj.lessonId === lessonId) {
                return obj.progress;
            }
        }
        return 0;
    },

    async releaseComment(commentData) {
        const result = await courseModel.releaseComment(commentData);
        return result;
    },

    async getCourseNotes(userId, courseId) {
        const result = await courseModel.getCourseNotes(userId, courseId);
        //1.获取用户相关信息
        for (let i = 0; i < result.length; i++) {
            const userInfo = await userModel.getUserInfoById(result[i].userId);
            result[i].avatar = userInfo.avatar;
            result[i].username = userInfo.name;
            //2.判断当前用户是否已点赞
            // const likeArr = result[i].like.split(',');
            // if (likeArr.indexOf('' + result[i].userId) != -1) {
            //     result[i].liked = true;
            // } else {
            //     result[i].liked = false;
            // }
        }
        return result;
    },

    async getDiscussData(courseId) {
        const result = await courseModel.getDiscussData(courseId);
        //对结果进行过滤，仅保留replyTo为空的讨论记录
        //replyTo字段非空表示某条评论记录
        const newRes = result.filter((item) => {
            return item.replyTo === null;
        });
        for (let i = 0; i < newRes.length; i++) {
            const item = newRes[i];
            //获取用户信息
            const userId = item.userId;
            const userInfo = await userModel.getUserInfoById(userId);
            item.userAvatar = userInfo.avatar;
            item.userName = userInfo.name;
            //将回复转换成数组形式
            if (item.reply) {
                item.reply = item.reply.split(',');
            } else {
                item.reply = [];
            }
            //将点赞转换为数组形式
            if (item.like) {
                item.like = item.like.split(',');
            } else {
                item.like = [];
            }
        }
        return newRes;
    },

    async getDiscussItem(discussId) {
        const currentDiscuss = await courseModel.getDiscussItem(discussId);
        const result = [];
        if (currentDiscuss[0].reply) {
            const replyIds = currentDiscuss[0].reply.split(',');
            for (let i = 0; i < replyIds.length; i++) {
                //获取用户信息

                const tmpDiscuss = await courseModel.getDiscussItem(
                    replyIds[i]
                );
                const item = tmpDiscuss[0];
                if (item) {
                    const userId = item.userId;
                    const userInfo = await userModel.getUserInfoById(userId);
                    item.userAvatar = userInfo.avatar;
                    item.userName = userInfo.name;
                    result.push(item);
                }
            }
        }
        return result;
    },

    async addDiscuss(discussData) {
        discussData.releaseDate = timetransfor(Date.now());
        discussData.like = 0;
        discussData.view = 0;
        const res = await courseModel.addDiscuss(discussData);
        //当添加的讨论为评论回复时，需要为被回复的discuss添加reply
        if (discussData.replyTo) {
            //获取刚插入的discuss的id
            const updateDisId = res.maxId;
            await courseModel.updateDiscuss({
                discussId: discussData.replyTo,
                attr: 'reply',
                addReplyId: updateDisId,
            });
            //生成一条消息记录
            //获取被评论用户id
            const replyToDataArr = await courseModel.getDiscussItem(
                discussData.replyTo
            );
            const newMessage = {
                discussId: discussData.replyTo,
                newReplyId: updateDisId,
                receiveUser: replyToDataArr[0].userId,
                viewed: 1,
            };
            await userModel.addMessage(newMessage);
        }
        return res;
    },

    async updateDiscuss(params) {
        const res = await courseModel.updateDiscuss(params);
        return res;
    },

    async deleteDiscuss(discussId) {
        let delIds = [discussId];
        //获取所有该讨论的回复
        const disDataArr = await courseModel.getDiscussItem(discussId);
        const reply = disDataArr[0].reply;
        if (reply) {
            delIds = delIds.concat(reply.split(','));
        }
        const res = await courseModel.deleteDiscuss(delIds);

        //处理当删除的discuss是某条回复时
        const replyToId = disDataArr[0].replyTo;
        if (replyToId) {
            //replyTo非空，表示它是回复
            //除了删除这条discuss还要修改被回复记录的reply数据
            const replyArr = await courseModel.getDiscussItem(replyToId);
            const updateReplyArr = replyArr[0].reply.split(',');
            const delIndex = updateReplyArr.indexOf(discussId);
            updateReplyArr.splice(delIndex, 1);
            replyArr[0].reply = updateReplyArr.join(',');
            await courseModel.updateSpecficDiscuss(replyArr[0]);
        }
        return res;
    },

    async getNoteComment(noteId) {
        const result = await courseModel.getNoteComment(noteId);
        for (let i = 0; i < result.length; i++) {
            const userInfo = await userModel.getUserInfoById(result[i].userId);
            result[i].avatar = userInfo.avatar;
            result[i].username = userInfo.name;
        }
        return result;
    },

    async getTestData(lessonId, answerInfo) {
        //获取基本题目信息
        const dict = ['A', 'B', 'C', 'D'];
        const data = await courseModel.getTestData(lessonId);
        const rightAnswer = [];
        const result = [];
        for (let question of data) {
            const obj = {
                desc: question.desc,
                type: question.type,
            };
            rightAnswer.push(question.answer);
            let optionArr = question.options.split(',');
            optionArr = optionArr.map((item, index) => {
                return {
                    label: dict[index] + ':' + item,
                    value: dict[index],
                };
            });
            obj.options = optionArr;
            result.push(obj);
        }
        //当传入answer,进一步对答案进行校验
        if (answerInfo) {
            const { userId, answers } = answerInfo;
            //对answers预处理，方便与正确答案比对
            for (let arr of answers) {
                arr = arr.sort((a, b) => {
                    return a - b;
                });
            }
            const checkAnswer = [];
            for (let i = 0; i < rightAnswer.length; i++) {
                if (rightAnswer[i] === answers[i].join(',')) {
                    checkAnswer.push({
                        myAnswer: answers[i],
                        right: true,
                        rightAnswer: rightAnswer[i],
                    });
                } else {
                    checkAnswer.push({
                        myAnswer: answers[i],
                        right: false,
                        rightAnswer: rightAnswer[i],
                    });
                }
            }
            //在result中插入做题结果
            for (let i = 0; i < result.length; i++) {
                Object.assign(result[i], checkAnswer[i]);
            }
        }

        return result;
    },

    async getDanMuByLessonId(lessonId) {
        const res = await courseModel.getDanMuByLessonId(lessonId);
        return res;
    },

    async addDanMu(danMuData) {
        delete danMuData.isNew;
        const res = await courseModel.addDanMu(danMuData);
        return res;
    },
};

module.exports = course;
