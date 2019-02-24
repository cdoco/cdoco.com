---
title: PHP 设计模式
date: 2017-11-01 16:43:57
tags:
  - 设计模式
  - php
category: 设计模式
cover_img: https://i.loli.net/2019/02/24/5c7231cce1985.png
---

## 什么叫设计模式 ？

> 设计模式 (Design Pattern) 是一套被反复使用、多数人知晓的、经过分类的、代码设计经验的总结。

## 目的 ？

## 单例模式 (Singleton)

> 单例模式确保某个类只有一个实例, 而且自行实例化并向整个系统提供这个实例。

- 单例模式有以下3个特点:

  1. 只能有一个实例。
  2. 必须自行创建这个实例。
  3. 必须给其他对象提供这一实例。

```php
<?php
class User {
    //静态变量保存全局实例
    private static $instance = null;

    //私有构造函数, 防止外界实例化对象
    private function __construct() {}

    //私有克隆函数, 防止外办克隆对象
    private function __clone() {}

    //静态方法, 单例统一访问入口
    public static function getInstance() {
        if (is_null(self::$instance) || isset(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getName() {
        echo 'hello world!';
    }
}
```

- 优点:

> 单例模式可以避免大量的new操作, 因为每一次new操作都会消耗内存资源和系统资源

- 缺点 ?

## 原型模式 (Prototype)

> 原型模式是先创建好一个原型对象, 然后通过clone原型对象来创建新的对象。适用于大对象的创建, 因为创建一个大对象需要很大的开销, 如果每次new就会消耗很大, 原型模式仅需内存拷贝即可。

```php
<?php
interface Prototype {
    public function copy();
}

class ConcretePrototype implements Prototype {
    private $name;
    public function __construct($name) {
        $this->name = $name;
    } 
    public function copy() {
        return clone $this;
    }
}

class Demo {}

// client

$demo = new Demo();
$object1 = new ConcretePrototype($demo);
$object2 = $object1->copy();
```

- **深拷贝 ？** **浅拷贝 ？**

## 迭代器模式 (Decorator)

> 迭代器模式是遍历集合的成熟模式, 迭代器模式的关键是将遍历集合的任务交给一个叫做迭代器的对象, 它的工作时遍历并选择序列中的对象, 而客户端程序员不必知道或关心该集合序列底层的结构。

- 迭代器模式, 在不需要了解内部实现的前提下, 遍历一个聚合对象的内部元素。
- 相比传统的编程模式, 迭代器模式可以隐藏遍历元素的所需操作。

```php
<?php
//抽象迭代器
abstract class IIterator {
    public abstract function First();
    public abstract function Next();
    public abstract function IsDone();
    public abstract function CurrentItem();
}

//具体迭代器
class ConcreteIterator extends IIterator {
    private $aggre;
    private $current = 0;
    public function __construct(array $tmpAggre) {
        $this->aggre = $tmpAggre;
    }
    //返回第一个
    public function First() {
        return $this->aggre[0];
    }

    //返回下一个
    public function Next() {
        $this->current++;
        if ($this->current < count($this->aggre)) {
            return $this->aggre[$this->current];
        }
        return false;
    }

    //返回是否IsDone
    public function IsDone() {
        return $this->current >= count($this->aggre) ? true : false;
    }

    //返回当前聚集对象
    public function CurrentItem() {  
        return $this->aggre[$this->current];
    }
}

$iterator= new ConcreteIterator(array('周杰伦','王菲','周润发'));
$item = $iterator->First();
echo $item . "\n";
while(!$iterator->IsDone()) {  
    echo "{$iterator->CurrentItem()}：请买票！<br/>";
    $iterator->Next();
}
```

## 状态模式 (State)

> 允许一个对象在其内部状态改变时改变它的行为, 对象看起来似乎修改了它的类。其别名为状态对象(Objects for States), 状态模式是一种对象行为型模式。

- 在很多情况下, 一个对象的行为取决于一个或多个动态变化的属性, 这样的属性叫做状态, 这样的对象叫做有状态的(stateful)对象, 这样的对象状态是从事先定义好的一系列值中取出的。当一个这样的对象与外部事件产生互动时, 其内部状态就会改变, 从而使得系统的行为也随之发生变化。

```php
<?php
//抽象状态类:
abstract class State {
    protected $balance; //余额
    abstract public function recommend(); //推荐
}

//具体状态类, 屌丝类 (少于10元)
class DiaosiState extends State {
    //提醒或者推荐
    public function recommend() {
        echo "别撸啦, 停机了女神电话就打不进来拉, 赶快充值";
    }
}

//具体状态类, 中产类(多于10元，少于1000)
class ZhongchanState extends State {
    //提醒或者推荐
    public function recommend(){
        echo "4G套餐不错哦, 妈妈再也不用担心我的话费用不完啦";
    }
}

//具体状态类, 土豪类(多于1000)
class TuhaoState extends State {
    //提醒或者推荐
    public function recommend() {
        echo "e租宝不错哦, 人傻钱多速来";
    }
}

//应用环境类, 简单的理解为调用环境就可以了
class Context {
    private $state;
    public function setState($balance) {
         if ($balance < 10) {
              $this->state = new DiaosiState();
         } else if($balance > 1000) {
              $this->state = new TuhaoState();
         } else {
              $this->state = new ZhongchanState();
         }
    }

    public function recommend() {
        $this->state->recommend();
    }
}

//测试
$context = new Context();
$context->setState(100);
$context->recommend();
```