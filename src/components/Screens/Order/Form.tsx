import FieldText from '@react-form-fields/native-base/Text';
import ValidationContext, { IValidationContextRef } from '@react-form-fields/native-base/ValidationContext';
import { Button, Container, Content, Form, Icon, List } from 'native-base';
import React, { memo, useEffect, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { useCallbackObservable } from 'react-use-observable';
import { of, timer } from 'rxjs';
import { filter, first, switchMap, tap } from 'rxjs/operators';
import { classes } from '~/assets/theme';
import Toast from '~/facades/toast';
import { loader } from '~/helpers/rxjs-operators/loader';
import { logError } from '~/helpers/rxjs-operators/logError';
import useModel from '~/hooks/useModel';
import { IUseNavigation, useNavigation } from '~/hooks/useNavigation';
import { IOrder } from '~/interfaces/models/order';
import orderService from '~/services/order';

const OrderScreen = memo((props: IUseNavigation) => {
  const navigation = useNavigation(props);
  const validationRef = useRef<IValidationContextRef>();

  const [model, setModelProp] = useModel<IOrder>();

  const [description, setDescription] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [value, setValue] = useState<number>(0);

  function handleSave() {
    onSave();
  }

  const [onSave] = useCallbackObservable(() => {
    return of(true).pipe(
      tap(() => Keyboard.dismiss()),
      switchMap(() => timer(500)),
      first(),
      switchMap(() => validationRef.current.isValid()),
      tap(valid => !valid && Toast.showError('Revise os campos')),
      filter(valid => valid),
      switchMap(() =>
        orderService
          .save({
            description,
            quantity,
            value
          } as IOrder)
          .pipe(loader())
      ),
      logError(),
      tap(
        () => {
          setDescription('');
          setQuantity(0);
          setValue(0);
          Toast.show('Sucesso! Pedido realizado com sucesso', 2000, 'success');
        },
        err => Toast.showError(err)
      )
    );
  }, [model, navigation, description, quantity, value]);

  useEffect(() => {
    navigation.setParam({ handleSave });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container style={styles.orderContainer}>
      <Content padder keyboardShouldPersistTaps='handled'>
        <Form>
          <ValidationContext ref={validationRef}>
            <List>
              <FieldText
                label='Descrição'
                validation='string|required|min:3|max:255'
                value={description}
                flowIndex={0}
                onChange={value => setDescription(value)}
                style={styles.field}
              />

              <FieldText
                label='Quantidade'
                value={quantity}
                flowIndex={2}
                onChange={value => setQuantity(value)}
                style={styles.field}
              />

              <FieldText
                label='Valor'
                value={value}
                flowIndex={3}
                onChange={value => setValue(value)}
                style={styles.field}
              />
            </List>
          </ValidationContext>
        </Form>
      </Content>
    </Container>
  );
});

OrderScreen.navigationOptions = ({ navigation }) => {
  return {
    title: 'Novo pedido',
    headerRight: (
      <Button style={classes.headerButton} onPress={navigation.getParam('handleSave')}>
        <Icon style={classes.headerButtonIcon} name='save' />
      </Button>
    ),
    drawerIcon: ({ tintColor }) => <Icon name='list-box' style={{ color: tintColor }} />
  };
};

export default OrderScreen;
