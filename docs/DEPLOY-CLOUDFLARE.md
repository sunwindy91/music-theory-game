# Cloudflare Pages 国内镜像部署


## 前置

- 注册 [Cloudflare](https://dash.cloudflare.com/sign-up)（免费）
- 项目目录：`C:\Users\23017\music-theory-game`
- 纯静态站，**无需构建命令**

---

## 方式 A：命令行部署（推荐，可重复更新）

### 1. 登录 Cloudflare

PowerShell：

```powershell
cd C:\Users\23017\music-theory-game
npx wrangler login
```

浏览器会打开，授权后回到终端。

### 2. 首次创建 Pages 项目

```powershell
npx wrangler pages project create music-theory-game --production-branch=master
```

若提示项目已存在，跳过此步。

### 3. 上传并发布

```powershell
npx wrangler pages deploy . --project-name=music-theory-game --branch=master
```

成功后会输出访问地址，一般为：

```text
https://music-theory-game.pages.dev/
```

### 4. 更新 `core/features.js` 中的国内链接

若实际域名与上面不同，修改：

```js
const AppUrls = {
  domestic: "https://你的项目名.pages.dev/",
  overseas: "https://music-theory-game.vercel.app/"
};
```

然后重新 deploy 一次。

### 5. 以后每次改代码

```powershell
cd C:\Users\23017\music-theory-game
npx wrangler pages deploy . --project-name=music-theory-game --branch=master
```


```powershell
git add -A
git commit -m "描述改动"
git push origin master
```

---

## 方式 B：网页直接上传（不用命令行）

1. Cloudflare 控制台 → **Workers & Pages** → **Create**
2. 选 **Pages** → **Upload assets**
3. 项目名：`music-theory-game`
4. 把整个 `music-theory-game` 文件夹拖进去（或 zip 根目录内容）
5. **Deploy site**

---

## 双线路分享建议

| 用途 | 链接 |
|------|------|
| 国内朋友 | `https://music-theory-game.pages.dev/` |
| 海外 / 备用 | `https://music-theory-game.vercel.app/` |

公众号 / 分享卡片会使用 `AppUrls.domestic`（Cloudflare 链接）。

---

## 常见问题

**Q：pages.dev 国内打不开？**  
少数网络仍可能慢；可后续绑定自己的域名（Cloudflare 控制台 → Custom domains）。

**Q：和 Vercel 要同步改两次吗？**  
代码同一份；Vercel 用 `npx vercel --prod`，Cloudflare 用 `wrangler pages deploy`，各部署一次。

**Q：需要 package.json 吗？**  
不需要；`npx wrangler` 即可。
