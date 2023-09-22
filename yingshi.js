/**
 * Yingshi plugin for Deup
 *
 * @class Yingshi
 * @extends {Deup}
 * @author ZiHang Gao
 */
class Yingshi extends Deup {
  /**
   * Define the basic configuration of the yingshi plugin
   *
   * @type {{layout: string, name: string, logo: string, pageSize: number, timeout: number}}
   */
  config = {
    name: 'Movies & TV',
    layout: 'poster',
    timeout: 10000,
    pageSize: 20,
  };

  /**
   * Check inputs
   *
   * @returns {Promise<boolean>}
   */
  async check() {
    return (await this.list()).length > 0;
  }

  /**
   * Get the object information
   *
   * @param object
   * @returns {Promise<any>}
   */
  async get(object) {
    return object;
  }

  /**
   * Get the video list
   *
   * @param object
   * @param offset
   * @param limit
   * @returns {Promise<*>}
   */
  async list(object = null, offset = 0, limit = 20) {
    const page = Math.floor(offset / limit) + 1;
    const response = await $axios.get(
      `https://cj.ffzyapi.com/api.php/provide/vod?ac=detail&pg=${page}`,
    );

    try {
      return this.formatVideoList(response.data);
    } catch (e) {
      $alert(e.message);
    }

    return [];
  }

  /**
   * Get the video list by keyword
   *
   * @param object
   * @param keyword
   * @param offset
   * @param limit
   * @returns {Promise<*>}
   */
  async search(object, keyword, offset, limit) {
    const page = Math.floor(offset / limit) + 1;
    const response = await $axios.get(
      `https://cj.ffzyapi.com/api.php/provide/vod?ac=detail&wd=${keyword}&pg=${page}`,
    );

    try {
      return this.formatVideoList(response.data);
    } catch (e) {
      $alert(e.message);
    }

    return [];
  }

  /**
   * Format object list
   *
   * @param data
   * @returns {*}
   */
  formatVideoList(data) {
    return data.list.map((video) => {
      const playUrls = video.vod_play_url
        .split(video.vod_play_note)[1]
        .split('#');

      return {
        id: `${video.vod_id}`,
        name: playUrls.length > 1 ? playUrls[0].split('$')[0] : video.vod_name,
        type: 'video',
        remark: video.vod_remarks,
        thumbnail: video.vod_pic,
        poster: video.vod_pic,
        modified: new Date(video.vod_time).toISOString(),
        url: playUrls[0].split('$')[1],
        related: playUrls.map((value, key) => {
          const [name, url] = value.split('$');
          return {
            id: key === 0 ? `${video.vod_id}` : `${video.vod_id}#${key + 1}`,
            name: playUrls.length > 1 ? name : video.vod_name,
            url,
            type: 'video',
            thumbnail: video.vod_pic,
          };
        }),
      };
    });
  }
}

Deup.execute(new Yingshi());
