import { mount } from '@vue/test-utils'
import StatusBadge from '@/components/ui/StatusBadge.vue'

describe('StatusBadge.vue', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(StatusBadge)
    expect(wrapper.text()).toBe('Info')
    expect(wrapper.classes()).toContain('badge-info')
  })

  it('renders correctly with success status', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'success'
      }
    })
    expect(wrapper.text()).toBe('Success')
    expect(wrapper.classes()).toContain('badge-success')
  })

  it('renders correctly with danger status', () => {
    const wrapper = mount(StatusBadge, {
      props: {
        status: 'danger'
      }
    })
    expect(wrapper.text()).toBe('Danger')
    expect(wrapper.classes()).toContain('badge-danger')
  })
})
