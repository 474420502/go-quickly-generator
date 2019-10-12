package main

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

// DoFunc 非常丑陋
func DoFunc(a func(
	a int,
	b struct {
		A, B int
		C    string
	})) {
	return
}

// ExStruct 升级
type ExStruct struct {
	ChildStruct struct {
		A    int
		B    interface{}
		girl string
		boy  int
	}
	C     string
	D     func(a int, b string)
	child string
}

// GetChildStructBoy Get return boy int
func (es *ExStruct) GetChildStructBoy() int {
	return es.ChildStruct.boy
}

// SetChildStructBoy Set boy int
func (es *ExStruct) SetChildStructBoy(boy int) {
	es.ChildStruct.boy = boy
}

// GetChildStructGirl Get return girl string
func (es *ExStruct) GetChildStructGirl() string {
	return es.ChildStruct.girl

}

// SetChildStructGirl Set girl string
func (es *ExStruct) SetChildStructGirl(girl string) {
	es.ChildStruct.girl = girl
}

// GetChildStructGirl

// GetChildStructB Get return B interface{}
func (es *ExStruct) GetChildStructB() interface{} {
	return es.ChildStruct.B
}

// SetChildStructB Set B interface{}
func (es *ExStruct) SetChildStructB(B interface{}) {
	es.ChildStruct.B = B
}

// SetChildStructA set
func (es *ExStruct) SetChildStructA(a int) {
	es.ChildStruct.A = a
}

// GetChildStructA get
func (es *ExStruct) GetChildStructA() int {
	return es.ChildStruct.A
}

// GetC get
func (es *ExStruct) GetC(a int) {
	es.ChildStruct.A = a
}

func main() {
	a := ExStruct{}
	b := MyStruct{}
	c := MyStruct2{}
	println(a, b, c)
}
