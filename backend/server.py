#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import os
import time
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer

# 模拟数据库存储
MOCK_PROPERTIES = [
  {
    "id": "YW-2024001",
    "title": "义乌北苑 精装一室一卫",
    "location": "北苑街道",
    "city": "金华市",
    "district": "义乌市",
    "address": "浙江省金华市义乌市北苑路88号",
    "price": 1800,
    "area": 35.0,
    "layout": "1室1卫",
    "tags": ["空调", "衣柜", "热水器", "WiFi", "冰箱", "油烟机"],
    "imageUrls": [
      "/assets/images/google/property-1.jpg",
      "https://picsum.photos/seed/p1/800/600",
      "https://picsum.photos/seed/p2/800/600"
    ],
    "hasVideo": True,
    "status": "招租中",
    "publishDate": "2024-01-20",
    "appointments": [{ "name": "王女士 (个人)", "time": "明天 14:30", "staff": "小张", "confirmed": True }],
    "description": "【精品单身公寓】位于核心地段，周边配套齐全，交通便利。房间采光通透，现代简约装修风格，配备全套品牌家电（空调、热水器、冰箱、洗衣机等），真正实现拎包入住。公寓提供24小时安保巡逻及智能化门禁系统，环境安全舒适，是追求生活品质的都市精英及学子的理想居所。",
    "coords": [29.3242, 120.0673]
  },
  {
    "id": "YW-2024105",
    "title": "福田二区 现代简约两室一卫",
    "location": "福田街道",
    "city": "金华市",
    "district": "义乌市",
    "address": "浙江省金华市义乌市福田二区25栋",
    "price": 3200,
    "area": 65,
    "layout": "2室1卫",
    "tags": ["空调", "衣柜", "热水器", "WiFi", "冰箱", "油烟机", "洗衣机"],
    "imageUrls": [
      "/assets/images/google/property-2.jpg",
      "https://picsum.photos/seed/p3/800/600"
    ],
    "hasVideo": True,
    "isNew": True,
    "status": "招租中",
    "publishDate": "2024-02-15",
    "appointments": [],
    "description": "【精品单身公寓】位于核心地段，周边配套齐全，交通便利。房间采光通透，现代简约装修风格，配备全套品牌家电（空调、热水器、冰箱、洗衣机等），真正实现拎包入住。公寓提供24小时安保巡逻及智能化门禁系统，环境安全舒适，是追求生活品质的都市精英及学子的理想居所。",
    "coords": [29.3361, 120.0912]
  },
  {
    "id": "YW-2024106",
    "title": "稠江街道 舒适大三居",
    "location": "稠江街道",
    "city": "金华市",
    "district": "义乌市",
    "address": "浙江省金华市义乌市稠江街道万达广场旁",
    "price": 4500,
    "area": 110,
    "layout": "3室2卫",
    "tags": ["空调", "衣柜", "热水器", "WiFi", "冰箱", "洗衣机", "床"],
    "imageUrls": [
      "https://picsum.photos/seed/p4/800/600",
      "https://picsum.photos/seed/p5/800/600"
    ],
    "hasVideo": False,
    "status": "招租中",
    "publishDate": "2024-03-01",
    "appointments": [],
    "description": "【精品单身公寓】位于核心地段，周边配套齐全，交通便利。房间采光通透，现代简约装修风格，配备全套品牌家电（空调、热水器、冰箱、洗衣机等），真正实现拎包入住。公寓提供24小时安保巡逻及智能化门禁系统，环境安全舒适，是追求生活品质的都市精英及学子的理想居所。",
    "coords": [29.2895, 120.0485]
  }
]

MOCK_USERS = [
  {
    "id": "U001",
    "name": "张美玲",
    "phone": "138****5566",
    "sourceProperty": "义乌北苑 精装一室一卫",
    "authStatus": "已实名",
    "createTime": "2024-03-20 14:30"
  },
  {
    "id": "U002",
    "name": "李伟强",
    "phone": "159****8822",
    "sourceProperty": "福田二区 现代简约两室一卫",
    "authStatus": "已实名",
    "createTime": "2024-03-21 09:15"
  },
  {
    "id": "U003",
    "name": "陈小芳",
    "phone": "133****1144",
    "sourceProperty": "义乌北苑 精装一室一卫",
    "authStatus": "待认证",
    "createTime": "2024-03-22 18:05"
  }
]

MOCK_CHAT_MESSAGES = []

LANDLORD_CONFIG = {
  "name": "李先生",
  "avatar": "/assets/images/google/avatar.jpg",
  "phone": "13888888888",
  "wechatId": "HousePlatform_Service",
  "password": "admin"
}

class SimpleAPIHandler(BaseHTTPRequestHandler):
    def _send_response(self, status_code, content_type, content):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(content.encode('utf-8'))

    def do_OPTIONS(self):
        self._send_response(200, 'text/plain', '')

    def do_GET(self):
        if self.path == '/api/properties':
            # 获取所有房源
            self._send_response(200, 'application/json', json.dumps(MOCK_PROPERTIES))
        elif self.path.startswith('/api/properties/'):
            # 获取单个房源
            property_id = self.path.split('/')[-1]
            property = next((p for p in MOCK_PROPERTIES if p['id'] == property_id), None)
            if property:
                self._send_response(200, 'application/json', json.dumps(property))
            else:
                self._send_response(404, 'application/json', json.dumps({"message": "房源不存在"}))
        elif self.path == '/api/users':
            # 获取所有用户
            self._send_response(200, 'application/json', json.dumps(MOCK_USERS))
        elif self.path == '/api/chat':
            # 获取所有聊天消息
            self._send_response(200, 'application/json', json.dumps(MOCK_CHAT_MESSAGES))
        elif self.path == '/api/landlord/config':
            # 获取房东配置
            config = {k: v for k, v in LANDLORD_CONFIG.items() if k != 'password'}
            self._send_response(200, 'application/json', json.dumps(config))
        elif self.path == '/api/health':
            # 健康检查
            self._send_response(200, 'application/json', json.dumps({"status": "ok"}))
        else:
            # 其他路径返回404
            self._send_response(404, 'text/plain', 'Not Found')

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        data = json.loads(post_data) if post_data else {}

        if self.path == '/api/properties':
            # 添加房源
            new_property = {
                "id": "YW-{}".format(int(time.time())),
                "title": data.get("title", ""),
                "location": data.get("location", ""),
                "city": data.get("city", ""),
                "district": data.get("district", ""),
                "address": data.get("address", ""),
                "price": data.get("price", 0),
                "area": data.get("area", 0),
                "layout": data.get("layout", ""),
                "tags": data.get("tags", []),
                "imageUrls": data.get("imageUrls", []),
                "hasVideo": data.get("hasVideo", False),
                "isNew": data.get("isNew", False),
                "status": data.get("status", "招租中"),
                "publishDate": time.strftime("%Y-%m-%d"),
                "appointments": []
            }
            MOCK_PROPERTIES.insert(0, new_property)
            self._send_response(201, 'application/json', json.dumps(new_property))
        elif self.path == '/api/users':
            # 添加用户
            new_user = {
                "id": "U{:03d}".format(len(MOCK_USERS) + 1),
                "name": data.get("name", ""),
                "phone": data.get("phone", ""),
                "sourceProperty": data.get("sourceProperty", ""),
                "authStatus": "已实名",
                "createTime": time.strftime("%Y-%m-%d %H:%M")
            }
            MOCK_USERS.insert(0, new_user)
            self._send_response(201, 'application/json', json.dumps(new_user))
        elif self.path == '/api/chat':
            # 添加聊天消息
            new_message = {
                "id": "M{}".format(int(time.time())),
                "sender": data.get("sender", ""),
                "receiver": data.get("receiver", ""),
                "content": data.get("content", ""),
                "timestamp": int(time.time()),
                "isRead": False
            }
            MOCK_CHAT_MESSAGES.insert(0, new_message)
            self._send_response(201, 'application/json', json.dumps(new_message))
        elif self.path == '/api/landlord/login':
            # 房东登录
            password = data.get('password')
            if password == LANDLORD_CONFIG['password']:
                self._send_response(200, 'application/json', json.dumps({"success": True}))
            else:
                self._send_response(401, 'application/json', json.dumps({"success": False, "message": "密码错误"}))
        else:
            # 其他路径返回404
            self._send_response(404, 'text/plain', 'Not Found')

    def do_PUT(self):
        if self.path.startswith('/api/properties/'):
            # 更新房源
            property_id = self.path.split('/')[-1]
            property_index = next((i for i, p in enumerate(MOCK_PROPERTIES) if p['id'] == property_id), -1)
            if property_index != -1:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length).decode('utf-8')
                data = json.loads(post_data) if post_data else {}
                MOCK_PROPERTIES[property_index].update(data)     
                self._send_response(200, 'application/json', json.dumps(MOCK_PROPERTIES[property_index]))
            else:
                self._send_response(404, 'application/json', json.dumps({"message": "房源不存在"}))
        elif self.path == '/api/landlord/config':
            # 更新房东配置
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(post_data) if post_data else {}
            # 更新配置
            global LANDLORD_CONFIG
            LANDLORD_CONFIG.update(data)
            # 返回更新后的配置（不包含密码）
            config = {k: v for k, v in LANDLORD_CONFIG.items() if k != 'password'}
            self._send_response(200, 'application/json', json.dumps(config))
        else:
            # 其他路径返回404
            self._send_response(404, 'text/plain', 'Not Found')

    def do_DELETE(self):
        if self.path.startswith('/api/properties/'):
            # 删除房源
            property_id = self.path.split('/')[-1]
            property_index = next((i for i, p in enumerate(MOCK_PROPERTIES) if p['id'] == property_id), -1)
            if property_index != -1:
                MOCK_PROPERTIES.pop(property_index)
                self._send_response(200, 'application/json', json.dumps({"message": "房源删除成功"}))
            else:
                self._send_response(404, 'application/json', json.dumps({"message": "房源不存在"}))
        else:
            # 其他路径返回404
            self._send_response(404, 'text/plain', 'Not Found')

if __name__ == '__main__':
    server_address = ('', 3001)
    httpd = HTTPServer(server_address, SimpleAPIHandler)
    print('Server running on port 3001')
    httpd.serve_forever()
