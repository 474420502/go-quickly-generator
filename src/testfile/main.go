package main

import "database/sql"

// MyStruct 介绍
type MyStruct struct {
	Value int
	Key   string
	Do    func(
		a int,
		b struct {
			A, B int
			C    string
		})
	S struct{ A int }
}

type MyStruct2 struct {
	Value int
	Key   string
	Do    func(
		a int,
		b struct {
			A, B int
			C    string
		})
	S struct{ A struct{ C interface{} } }
}

// SetSAC Set C interface{}
func (ms *MyStruct2) SetSAC(C interface{}) {
	ms.S.A.C = C
}

// GetKey Get return Key string
func (ms *MyStruct2) GetKey() string {
	return ms.Key
}

// SetKey Set Key string
func (ms *MyStruct2) SetKey(Key string) {
	ms.Key = Key
}

// GetValue Get return Value int
func (ms *MyStruct2) GetValue() int {
	return ms.Value
}

// DoFunc 非常丑陋的兼容
func DoFunc(a func(
	a int,
	b struct {
		A, B int
		C    string
	})) {
	return
}

// ExStruct my struct
type ExStruct struct {
	ChildStruct struct {
		age    int
		Height interface{}
		girl   string
		boy    int
	}
	Age   string
	Do    func(a int, b string)
	child string
}

type Parent struct {
	Hello string
	DoIt  int
}

/*
CREATE TABLE `pay`
(
	`id` bigint(20) unsigned NOT NULL COMMENT '主键，支付单id，支付单流水号（有规则）',
	`m_id` bigint(20) unsigned NOT NULL COMMENT '签约商家id',
	`m_payline_id` bigint(20) unsigned NOT NULL COMMENT '商家支付业务线id',
	`out_trade_no` varchar(32) NOT NULL COMMENT '商家业务线订单号',
	`pay_type` tinyint(1) unsigned NOT NULL COMMENT '支付类型（在线支付、虚币支付、混合支付 ）',
	`pay_m_id` bigint(20) unsigned NOT NULL COMMENT '支付方式ID',
	`pay_m_code` varchar(16) COMMENT '支付方式编码',
	`pay_m_name` varchar(32) NOT NULL COMMENT '支付方式名称',
	`notify_ts` int(11) unsigned COMMENT '最新通知时间，Unix秒',
	`status_ts` int(11) unsigned NOT NULL COMMENT '状态变更时间，Unix秒',
	`create_ts` int(11) unsigned NOT NULL COMMENT '创建时间，Unix秒',
	`update_ts` int(11) unsigned NOT NULL COMMENT '修改时间，Unix秒',
	`finish_ts` int(11) unsigned NOT NULL COMMENT '支付完成时间（支付中心），Unix秒',
	`paying_ts` int(11) unsigned NOT NULL COMMENT '支付中时间，Unix秒',
	`payable_amount` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '应付金额，精确到分',
	`discount_amount` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '支付中心优惠金额，精确到分',
	`pay_amount` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '支付中心实付金额，精确到分'
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE KEY `idx_mpid_orno` (`m_payline_id`,`out_trade_no`) USING BTREE,
	KEY `status_ts_index` (`status_ts`) USING BTREE,
	KEY `create_ts_index` (`create_ts`) USING BTREE,
	KEY `update_ts_index` (`update_ts`) USING BTREE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='支付订单表';
*/

func main() {
	a := ExStruct{}
	b := MyStruct{}
	c := MyStruct2{}
	println(a, b, c)

	db, err := sql.Open("12", "sd")
	if err != nil {
		panic(err)
	}
	rows, _ := db.Query("")
	defer rows.Close()
}
