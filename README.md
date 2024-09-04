# 絶対に落ち込まない リアルタイムニュース

ニュースアプリを開くと、知りたくなくても目に飛び込んてくる悲しいニュースの数々・・・<br>
知るべきなのは分かっていても、自分に余裕がない時は読むだけで暗い気持ちになり更に追い込まれてしまう。<br>
今日ぐらいは悲しいニュースは読みたくない！自分を守りたい！そんな感受性豊かな繊細さんのためのニュースアプリです。<br>


## DEMO
#### ホーム画面
* 取得されるニュース記事はポジティブなニュースのみです。<br>
* サインインせずとも10件までのニュースを見ることができます。<br>
<img width="1272" alt="スクリーンショット 2024-09-03 22 40 33" src="https://github.com/user-attachments/assets/52796e90-ff2f-4480-8957-b412747f39fb">  

#### ユーザーTOP画面
* タイトル中央には自分の好きな写真を設定することができます。<br> 
* どんなニュースを読んでも好きなものや人の写真を見ることで、ユーザーの心を守ります。<br> 
* 気に入った記事は記事の右側にあるボタンでお気に入り保存することができます。<br>
<img width="1272" alt="スクリーンショット 2024-09-03 22 39 09" src="https://github.com/user-attachments/assets/0daaf758-2ee8-4faf-a6a5-c55135b22241">

#### マイページ画面
* トップで表示する画像はここで設定します。スマホ画像であれば上下に動かして最適なポジションを設定できます。<br>
* ユーザー名の変更も可能です。<br>
* お気に入り保存した記事はこちらから確認できます。<br>
<img width="1270" alt="スクリーンショット 2024-09-03 22 39 40" src="https://github.com/user-attachments/assets/14eb200e-7497-4e0b-9386-dd640e882110">



## Features
#### ★ネガティブな記事を排除するフィルタリング
自動的に悲しいニュースを排除し、ポジティブなニュースだけを表示します。<br>
ユーザーがメンタル面で疲れを感じることなく、ニュースを楽しむことができます。<br> 

#### ★リアルタイムでのニュース更新
ニュースはリアルタイムで更新されるので、ストレスフリーを維持しつつ常に最新のニュースを把握できます。<br>

#### ★トップ画像のカスタマイズ
ユーザーは常に自分の好きなものに囲まれながらニュースをチェックすることができます。<br>

#### ★お気に入り記事の保存
また読み返したくなるようなポジティブな記事を見つけたら、制限なく保存ができ好きな時に読むことができます。<br>


## 使用技術一覧

![Static Badge](https://img.shields.io/badge/React-98fb98)
![Static Badge](https://img.shields.io/badge/Next.js-ffff00)
![Static Badge](https://img.shields.io/badge/Firebase-ff8c00)
![Static Badge](https://img.shields.io/badge/ChakraUI-ee82ee)

#### API
#####　- [Google Cloud Natural Language API](https://cloud.google.com/natural-language/docs)
- **用途**: 各記事の感情分析を行い、ポジティブなニュースだけを表示するようにフィルタリングしています。<br>
#####　- RSSフィールド
- **用途**: 複数のニュースサイトから提供されるRSSフィードを使用して、最新のニュース記事を取得しています。<br>
リアルタイムでニュースを表示するために、RSSを定期的にフェッチして記事データをアプリ内に反映させています。。<br>



# Installation

Requirementで列挙したライブラリなどのインストール方法を説明する

```bash
pip install huga_package
```

# Usage

DEMOの実行方法など、"hoge"の基本的な使い方を説明する

```bash
git clone https://github.com/hoge/~
cd examples
python demo.py
```

# Note

注意点などがあれば書く

# Author

作成情報を列挙する

* 作成者
* 所属
* E-mail

# License
ライセンスを明示する

"hoge" is under [MIT license](https://en.wikipedia.org/wiki/MIT_License).

社内向けなら社外秘であることを明示してる

"hoge" is Confidential.
