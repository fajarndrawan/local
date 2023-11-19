var _ = require("lodash")
const { col, Op } = require("sequelize")
const { basicMenuModels } = require("../models/basicMenuModels")
const { basicMenuAccessModels } = require("../models/basicMenuAccessModels")
const { dynamicConnection } = require("../config/dynamicConnection")
const { ENV_PABRIK } = require("../config/collectionDatabase")
const { basicAppnameModels } = require("../models/basicAppnameModels")

const getBasicMenu = async (req, res) => {
  try {
    const userData = res.locals.userData
    const DB = await dynamicConnection(ENV_PABRIK, "ORM", res)
    const BASIC_MENU = basicMenuModels(DB)
    const BASIC_MENU_ACCESS = basicMenuAccessModels(DB)

    BASIC_MENU_ACCESS.belongsTo(BASIC_MENU, { foreignKey: 'id_basic_menu', targetKey: 'id' })
    const data = await BASIC_MENU_ACCESS.findAll({
      attributes: [
        ["id", "id_access"],
        [col("basic_menu.id"), "id"],
        [col("basic_menu.nama"), "nama"],
        [col("basic_menu.nama_route"), "nama_route"],
        [col("basic_menu.path"), "path"],
        [col("basic_menu.icon"), "icon"],
        [col("basic_menu.akses_lainya"), "akses_lainya"],
        [col("basic_menu.parent_id"), "parent_id"],
        [col("basic_menu.disabled"), "disabled"],
      ],
      include: [
        {
          model: BASIC_MENU,
          attributes: [],
          required: true,
        }
      ],
      order: [col("basic_menu.urutan")],
      where: {
        id_basic_role: userData.id_role
      }
    })

    return res.status(200).send({
      meta: {
        message: "Success!",
        code: res.statusCode,
        success: true,
        data: _.filter(data, idx => !idx.disabled)
      },
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      },
    })
  }
}

const getRoute = async (req, res) => {
  try {
    const userData = res.locals.userData
    const { appName } = req.query
    const DB = await dynamicConnection(ENV_PABRIK, "ORM", res)
    const BASIC_MENU = basicMenuModels(DB)
    const BASIC_MENU_ACCESS = basicMenuAccessModels(DB)
    const BASIC_APPNAME = basicAppnameModels(DB)

    BASIC_MENU_ACCESS.belongsTo(BASIC_MENU, { foreignKey: 'id_basic_menu', targetKey: 'id' })
    BASIC_MENU.belongsTo(BASIC_APPNAME, { foreignKey: 'id_basic_appname', targetKey: 'id' })
    const data = await BASIC_MENU_ACCESS.findAll({
      attributes: [
        ["id", "id_access"],
        [col("basic_menu.nama_route"), "nama_route"],
        [col("basic_menu.path"), "path"],
        [col("basic_menu.akses_lainya"), "akses_lainya"],
        [col("basic_menu.disabled"), "disabled"]
      ],
      include: [
        {
          model: BASIC_MENU,
          attributes: [],
          required: true,
          where: {
            nama_route: {
              [Op.ne]: ""
            }
          },
          include: [
            {
              model: BASIC_APPNAME,
              attributes: [],
              where: {
                nama: appName
              },
              required: true
            }
          ]
        }
      ],
      order: [col("basic_menu.urutan")],
      where: {
        id_basic_role: userData.id_role
      }
    })

    return res.status(200).send({
      meta: {
        message: "Success!",
        code: res.statusCode,
        success: true,
        data: _.filter(data, idx => !idx.disabled)
      },
    })
  } catch (error) {
    return res.status(400).send({
      meta: {
        message: error.message,
        code: res.statusCode,
        success: false,
      },
    })
  }
}

module.exports = { getBasicMenu, getRoute }
