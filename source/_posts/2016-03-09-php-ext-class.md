---
title: PHP扩展实现类
date: 2016-03-09 22:27:13
tags:
  - php扩展
  - php
category: php扩展
cover_img: https://i.loli.net/2019/02/24/5c7231556a150.jpg
---

### 现一个类Person，它有一个private的成员变量$_name和两个public的实例方法getName()和setName()，可以用 PHP代码表示如下：

```php
<?php class Person {
    private $_name;
    public function getName() {
        return $this->_name;
    }
    public function setName($name) {
        $this->_name = $name;
    }
}
```

<!-- more -->

### 声明方法：还使用第一篇文章里面用过的示例，首先在头文件php_echo.h里加入方法声明。

```c
PHP_METHOD(Person, __construct);
PHP_METHOD(Person, __destruct);
PHP_METHOD(Person, getName);
PHP_METHOD(Person, setName);
```
前面的扩展在声明函数时使用PHP_FUNCTION宏，而在实现类扩展时我们使用PHP_METHOD宏，第一个参数指定类名，第二个参数指定方法名。

### 方法实现：在echo.c文件中实现这几个方法，构造函数和析构函数中只是输出一些文本。

```c
PHP_METHOD(Person, __construct) {
  php_printf("__construct called.");
}

PHP_METHOD(Person, __destruct) {
  php_printf("__destruct called.<br/>");
}

PHP_METHOD(Person, getName) {
  zval *self, *name;
  self = getThis();
  name = zend_read_property(Z_OBJCE_P(self), self, ZEND_STRL("_name"), 0 TSRMLS_CC);
  RETURN_STRING(Z_STRVAL_P(name), 0);
}

PHP_METHOD(Person, setName) {
  char *arg = NULL;
  int arg_len;
  zval *value, *self;
  if (zend_parse_parameters(ZEND_NUM_ARGS() TSRMLS_CC, "s", &arg, &arg_len) == FAILURE) {
      WRONG_PARAM_COUNT;
  }
  self = getThis();
  MAKE_STD_ZVAL(value);
  ZVAL_STRINGL(value, arg, arg_len, 0);
  SEPARATE_ZVAL_TO_MAKE_IS_REF(&value);
  zend_update_property(Z_OBJCE_P(self), self, ZEND_STRL("_name"), value TSRMLS_CC);
  RETURN_TRUE;
}
```

对上面的代码做一些解释：

* A. 获取方法的参数信息，仍然使用zend_parse_parameters函数，与之前我们介绍过的一样；
* B. 获取this指针（相对于PHP代码而言，在PHP扩展中仍然使用zval结构表示）使用getThis()函数；
* C. 使用MAKE_STD_ZVAL宏申请并初始化一个zval结构，在PHP扩展中，所有的数据类型其实都是用zval结构来表示的，在本系列文章中我会单独写一篇来介绍zval。
* D. 获取属性值使用zend_read_property()函数，使用zend_update_property()函数更新属性值。

### 初始化类：在扩展初始化函数中，注册并初始化类。

```c
zend_class_entry *person_ce;

PHP_MINIT_FUNCTION(php_echo)
{
    zend_class_entry person; INIT_CLASS_ENTRY(person, "Person", php_echo_functions);
    person_ce = zend_register_internal_class_ex(&person, NULL, NULL TSRMLS_CC);

    zend_declare_property_null(person_ce, ZEND_STRL("_name"), ZEND_ACC_PRIVATE TSRMLS_CC); return SUCCESS;
}
```
使用INIT_CLASS_ENTRY宏初始化类，第二个参数指定类名，第三个参数是函数表。

### 注册到函数：声明方法的参数，并注册到函数表中。

```c
ZEND_BEGIN_ARG_INFO(arg_person_setname, 0)
    ZEND_ARG_INFO(0, name)
ZEND_END_ARG_INFO() const zend_function_entry php_echo_functions[] = {
    PHP_ME(Person, __construct, NULL, ZEND_ACC_PUBLIC|ZEND_ACC_CTOR)
    PHP_ME(Person, __destruct,  NULL, ZEND_ACC_PUBLIC|ZEND_ACC_DTOR)
    PHP_ME(Person, getName,     NULL, ZEND_ACC_PUBLIC)
    PHP_ME(Person, setName,     arg_person_setname, ZEND_ACC_PUBLIC)
    {NULL, NULL, NULL} /* Must be the last line in php_echo_functions[] */ };
```

类方法参数的声明与之前我们函数参数声明方式一致，在注册类方法到函数表中时使用PHP_ME宏，而不是之前使用的PHP_FE宏。

ZEND_ACC_PUBLIC：指定方法的访问修饰符

ZEND_ACC_CTOR：指定该方法为构造函数

ZEND_ACC_DTOR：指定该方法为析构函数

### 运行测试：编译安装扩展后，编写一段简单的测试脚本：

```php
<?php $person = new Person();
    $person->setName("mickelfeng"); echo $person->getName().'<br/>';
```
运行后可以看到如下输出，说明扩展工作正常：

```bash
__construct called.
mickelfeng
__destruct called.
```
