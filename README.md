# uni-app项目注册页面分离
在开发 uni-app 项目的时候 ，你是否有遇到过以下问题：
- 页面过多，注册页面都在同一个`pages.json`中，维护困难
- 开发过程中修改首页需要把指定页面放到 `pages` 数组第一位，不是那么优雅
- 多人协作，提交代码时 `pages.json` 文件经常冲突，或者需要专人管理`pages.json`
- 分包困难，注册页面经常需要手动放到分包节点下

综上所述，其实类似微信小程序原生开发的目录结构其实更适合多人协作，每个人维护特定的页面 ，而页面配置就在当前页面目录下，不论如何修改页面配置都不会对其他人造成影响。

这是一个强化uni-app项目 `pages.json` 的插件，让页面配置专注到每个页面

## 如何使用
**插件原理：通过 `pages.js` 实现 `pages.json` 的同步操作**

### 开启插件
将插件导入HbuilderX中，此时在项目上右键菜单会多两个选项：
- 插件--初始化项目路由 ： 开启插件 ，此时项目根目录会生成一个 pages.js 文件，此文件是插件的关键 ，请勿修改
- 插件--生成完整的 pages.json ： 会生成一个真实的 `pages.json` ， 不过一般用不到，如果要关闭插件，可以生成后替换原来的 `pages.json`

点击 `插件--初始化项目路由` 后，插件开启成功

**目录结构**
```
┌─pages               
│  ├─index
│  │  └─index.vue    
│  └─login
│     └─login.vue    
├─static             
├─main.js       
├─App.vue          
├─manifest.json  
├─pages.json 
└─pages.js // 有此文件表示插件开启
```


### 清爽的 pages.json
将页面从`pages.json`中分离出来  ，`pages.json`只做全局配置 ，可以不用配置 `pages` 节点，如果未使用插件的单页面配置 ，`pages` 节点可以正常生效。

```json
// pages.json
{
	"globalStyle": {
		"navigationBarTextStyle": "white",
		"navigationBarTitleText": "uni-app",
		"navigationBarBackgroundColor": "#007AFF",
		"backgroundColor": "#FFFFFF",
		"app-plus": {
			"background": "#efeff4"
		}
	},
	"tabbar":{}
}
```

### 快速设置首页

`pages.json` 新增 `home` 节点，快速指定首页

```json
// pages.json
{
	"home":"pages/index/index",
	"globalStyle": {},
	"tabbar":{}
}
```

### 页面配置
**推荐创建页面的时候勾选创建同名目录**

在需要注册的页面上右键 `插件--生成页面配置文件`，点击快速生成与页面同名且`.json`后缀的默认页面配置文件。配置方式参考uni-app的页面配置方式，没有变化。

页面配置会覆盖 `pages.json > pages` 下对应页面配置

**目录结构**
```
┌─pages               
│  ├─index
│  │  ├─index.vue  // 在当前文件右键生成下面的文件
│  │  └─index.json // index 页面配置文件    
│  └─login
│     ├─login.vue  // 在当前文件右键生成下面的文件  
│     └─login.json // login 页面配置文件    
├─static             
├─main.js       
├─App.vue          
├─manifest.json  
├─pages.json 
└─pages.js // 有此文件表示插件开启
```


### 分包
分包是基于文件夹来分包的，以下面的目录结构为例子。

在 `pagesA` 目录上右键 `插件--生成分包文件` ，会生成一个 `subPackage.json` , 此时整个文件夹下所有的页面可以看做是同一个分包。

Tips:
- 每个分包下只需要有一个 `subPackage.json` 文件，嵌套可能会出现未知问题
- 如果不想让当前的某个页面加入分包，则不需要配置 `.json` ，将页面注册到 pages.json 的 pages 节点下即可


**目录结构**
```
┌─pages               
│  ├─index
│  │  ├─index.vue    
│  │  └─index.json	// index 页面配置文件    
│  ├─login
│  │  ├─login.vue    
│  │  └─login.json	// login 页面配置文件   
│  ├─pagesA	// 在当前目录右键生成下面的subPackage.json 
│  │  ├─static
│  │  ├─list
│  │  │  └─list.vue 
│  │  └─ subPackage.json // pagesA 的分包
│  ├─pagesB	// 在当前目录右键生成下面的subPackage.json 
│  │  ├─static
│  │  ├─detail
│  │  │  └─detail.vue 
│  │  └─ subPackage.json // pagesB 的分包
├─static             
├─main.js       
├─App.vue          
├─manifest.json  
├─pages.json 
└─pages.js // 有此文件表示插件开启 
```

**Tips:**

- pages.json 根节点新增 home 节点 ，指定首页，无需修改位置
- 单独配置某一个页面的配置，配置会覆盖 pages.json > pages 下对应页面配置
- json 文件不支持条件编译和注释
- 修改页面配置会触发页面的热更新，无需重新运行项目
- 新增页面配置，需要重新运行或对其他json文件修改保存即可更新
- 不支持 uni_modules 页面模板
- 分包内禁止包含另外的分包文件
- 分包内页面不能做为首页

## 其他
制作这个插件是希望真正的可以对大家有帮助 ，并且希望大家可以共同的将内容维护起来，插件已开源，也希望大家可以共同开发。

如有任何问题，或者有更好的想法，希望可以反馈给我。

# `请务必下载后五星好评+收藏，您的支持是作者最大的动力！感谢，(ง •_•)ง`  
或者可以加q群 166188735 来一起讨论啊(ps: 不一定有时间解答问题，一切随缘)。