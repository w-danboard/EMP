const path = require('path')
const webpack = require('webpack')
const WebpackChain = require('webpack-chain')
const HtmlWebpackPlugin = require('html-webpack-plugin')

function processDefault (empConfig) {
  const devServer = empConfig.server || {} // remote: 8001 host: 8002
  delete empConfig.server
  // 创建模块联邦选项对象
  const mfOptions = {
    filename: 'emp.js', // 指定当前容器为了对外提供模块联邦的服务，生成的单独文件emp.js
    ...empConfig.empShare
  }
  delete empConfig.empShare
  // 我们现在写的是webpack-chain的配置文件，不是真正的webpack配置文件，所以说写法跟webpack不太一样
  return {
    context: process.cwd(), // 项目根目录
    mode: 'development', // 指定开发模式
    devtool: false,
    devServer,
    plugin: {
      html: {
        plugin: HtmlWebpackPlugin, // 插件的构造函数
        args: [
          {
            template: path.join(__dirname, '../template/index.html')
          }
        ]
      },
      mf: {
        plugin: webpack.container.ModuleFederationPlugin,
        args: [ mfOptions ]
      }
    },
    module: {
      rule: {
        compile: {
          test: /\.js$/,
          exclude: [/node_modules/],
          use: {
            'babel-loader': {
              loader: require.resolve('babel-loader'),
              options: {
                presets: [
                  require.resolve('@babel/preset-env'),
                  require.resolve('@babel/preset-react'),
                ]
              }
            }
          }
        }
      }
    },
    ...empConfig
  }
}

exports.getConfig = () => {
  const Config = new WebpackChain()
  const empConfigPath = path.resolve(process.cwd(), 'emp-config.js')
  const empConfig = require(empConfigPath)
  const afterConfig = processDefault(empConfig)
  Config.merge(afterConfig)
  // 把Chain对象转成一个webpack配置对象
  console.log(Config.toConfig())
  return Config.toConfig()
}

// EMP的核心功能就是帮你配了一套webpack配置文件
/**
plugins: [
    new HtmlWebpackPlugin({ template: path.join(__dirname, '../template/index.html') }),
    new webpack.container.ModuleFederationPlugin({
      // 指定导出 remoteEntry 文件的名称，这个文件包含了模块联邦的运行时和引导代码
      filename: 'emp.js',
      // name string 必传值 输出的模块名
      name: 'remote' 'host'
      // 定义当前应用，要暴露给其他模块的的模块
      exports: {
        './App': './src/App.js'
      }
      // 当前应用使用其他应用，可以使用这个别名
      remotes: {
        '@remote': 'remote@http://xxx/emp.js'
      }
    })
]
*/
